/**
 * CHECKOUT SERVICE - JAZZCASH PAYMENT INTEGRATION
 * ===============================================
 *
 * This file handles JazzCash payment gateway integration for checkout.
 *
 * PAYMENT MODES:
 * - JAZZCASH_TEST_MODE=true: Use JazzCash sandbox
 * - PAYMENT_BYPASS=true: Show payment options but skip actual processing
 *
 * When PAYMENT_BYPASS=true:
 *   - Payment options display but transactions are mocked
 *   - Orders are created successfully for testing
 *
 * When JAZZCASH_TEST_MODE=true:
 *   - Uses JazzCash sandbox environment
 *   - Real payment flow but with test credentials
 */

import jazzCashService from "@/infra/payment/jazzcash";
import AppError from "@/shared/errors/AppError";
import prisma from "@/infra/database/database.config";
import redisClient from "@/infra/cache/redis";
import { PAYMENT_METHOD } from "@prisma/client";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";

function safeImage(images: string[] = []): string {
  return images?.[0] || PLACEHOLDER_IMAGE;
}

function validImage(url: string): string {
  return url.length <= 2048 ? url : PLACEHOLDER_IMAGE;
}

export class CheckoutService {
  constructor() {}

  async createJazzCashPayment(cart: any, userId: string) {
    // Validate stock for all cart items
    for (const item of cart.cartItems) {
      if (item.variant.stock < item.quantity) {
        throw new AppError(
          400,
          `Insufficient stock for variant ${item.variant.sku}: only ${item.variant.stock} available`
        );
      }
    }

    // Group cart items by sellerId
    const itemsBySeller = new Map<string, any[]>();

    for (const item of cart.cartItems) {
      const sellerId = item.variant.product.sellerId || "platform";
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, []);
      }
      itemsBySeller.get(sellerId)!.push(item);
    }

    // Calculate total amount
    const totalAmount = cart.cartItems.reduce(
      (sum: number, item: any) => sum + item.quantity * item.variant.price,
      0
    );

    // Generate unique transaction reference
    const txnRefNo = `JAZZ_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Get user details for payment description
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    // Create payment request
    const paymentRequest = await jazzCashService.createPaymentRequest({
      txnRefNo,
      amount: totalAmount,
      currency: "PKR", // JazzCash uses PKR
      billReference: `CART_${cart.id}`,
      description: `Order payment by ${user?.name || 'Customer'} - ${cart.cartItems.length} items`,
      customerInfo: {
        email: user?.email,
        name: user?.name
      }
    });

    if ('mockResponse' in paymentRequest) {
      // PAYMENT BYPASS MODE: Return mock response
      return {
        txnRefNo,
        paymentUrl: null,
        totalAmount,
        mockResponse: paymentRequest.mockResponse
      };
    }

    // Store seller grouping in metadata for callback processing
    const sellerGroups = Array.from(itemsBySeller.entries()).map(([sellerId, items]) => ({
      sellerId: sellerId === "platform" ? null : sellerId,
      itemCount: items.length,
      totalAmount: items.reduce((sum, item) => sum + item.quantity * item.variant.price, 0),
    }));

    // Store transaction metadata in Redis or database for callback processing
    const paymentMetadata = {
      userId,
      cartId: cart.id,
      txnRefNo,
      totalAmount,
      sellerGroups: JSON.stringify(sellerGroups),
      timestamp: new Date().toISOString()
    };

    // Store in Redis for callback processing (expires in 24 hours)
    await redisClient.setex(
      `jazzcash_payment_${txnRefNo}`,
      24 * 60 * 60,
      JSON.stringify(paymentMetadata)
    );

    return {
      txnRefNo,
      paymentUrl: paymentRequest.paymentUrl,
      totalAmount,
      requestData: paymentRequest.requestData
    };
  }

  async createCashOnDeliveryOrder(cart: any, userId: string) {
    // Validate stock for all cart items
    for (const item of cart.cartItems) {
      if (item.variant.stock < item.quantity) {
        throw new AppError(
          400,
          `Insufficient stock for variant ${item.variant.sku}: only ${item.variant.stock} available`
        );
      }
    }

    // Group cart items by sellerId
    const itemsBySeller = new Map<string, any[]>();
    
    for (const item of cart.cartItems) {
      const sellerId = item.variant.product.sellerId || "platform";
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, []);
      }
      itemsBySeller.get(sellerId)!.push(item);
    }

    const result = await prisma.$transaction(async (tx) => {
      const createdOrders: any[] = [];
      const createdPayments: any[] = [];
      const createdTransactions: any[] = [];
      const createdShipments: any[] = [];
      let createdAddress: any = null;

      // Create separate order for each seller
      for (const [sellerKey, items] of itemsBySeller.entries()) {
        const sellerId = sellerKey === "platform" ? "platform-seller-id" : sellerKey;
        const orderAmount = items.reduce(
          (sum, item) => sum + item.quantity * item.variant.price,
          0
        );

        // Generate unique order number
        let orderNumber = this.generateOrderNumber();
        let existingOrder = await tx.order.findUnique({
          where: { orderNumber },
        });
        while (existingOrder) {
          orderNumber = this.generateOrderNumber();
          existingOrder = await tx.order.findUnique({
            where: { orderNumber },
          });
        }

        // Create Order with orderNumber and sellerId
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            sellerId,
            amount: orderAmount,
            orderItems: {
              create: items.map((item: any) => ({
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.variant.price,
                sellerId: item.variant.product.sellerId!,
              })),
            },
          },
        });

        createdOrders.push(order);

        // Create Address (only once, link to first order)
        if (!createdAddress) {
          createdAddress = await tx.address.create({
            data: {
              orderId: order.id,
              userId,
              city: "Pending",
              state: "Pending",
              country: "Pending",
              zip: "Pending",
              street: "Pending - COD Order",
            },
          });
        }

        // Create Payment for this seller's order (COD)
        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            userId,
            sellerId,
            method: PAYMENT_METHOD.CASH_ON_DELIVERY,
            amount: orderAmount,
            status: "PENDING", // COD payments are pending until delivery
          },
        });
        createdPayments.push(payment);

        // Create Transaction
        const transaction = await tx.transaction.create({
          data: {
            orderId: order.id,
            status: "PENDING",
            transactionDate: new Date(),
          },
        });
        createdTransactions.push(transaction);

        // Create Shipment
        const shipment = await tx.shipment.create({
          data: {
            orderId: order.id,
            carrier: "Cash on Delivery",
            trackingNumber: "COD-" + orderNumber,
            shippingNotes: "Payment to be made on delivery",
            shippedDate: new Date(),
            deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days delivery estimate
          },
        });
        createdShipments.push(shipment);

        // Update Variant Stock and Product Sales Count for this seller's items
        for (const item of items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true, product: { select: { id: true, salesCount: true } } },
          });
          if (!variant) {
            throw new AppError(404, `Variant not found: ${item.variantId}`);
          }
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: variant.stock - item.quantity },
          });
          await tx.product.update({
            where: { id: variant.product.id },
            data: { salesCount: variant.product.salesCount + item.quantity },
          });
        }
      }

      // Clear the Cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: { status: "CONVERTED" },
      });

      return { 
        orders: createdOrders, 
        payments: createdPayments, 
        transactions: createdTransactions, 
        shipments: createdShipments, 
        address: createdAddress 
      };
    });

    return result;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `COD-${timestamp}-${random}`;
  }
}
