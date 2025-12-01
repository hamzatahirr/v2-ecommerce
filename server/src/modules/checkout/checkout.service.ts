/**
 * CHECKOUT SERVICE - STRIPE PAYMENT MOCKING FOR TESTING
 * =====================================================
 * 
 * This file uses Stripe for checkout session creation.
 * 
 * TO ENABLE MOCK PAYMENTS:
 *   Set TEST_PAYMENTS=true in your .env file
 *   The stripe client in @/infra/payment/stripe will automatically use mocks
 * 
 * TO RESTORE REAL STRIPE:
 *   Set TEST_PAYMENTS=false or remove the variable from .env
 * 
 * When TEST_PAYMENTS=true:
 *   - Checkout sessions are created with mock IDs
 *   - No actual Stripe API calls are made
 *   - Database updates still occur normally when webhooks are processed
 * 
 * After testing, restore real Stripe by setting TEST_PAYMENTS=false
 */

import stripe from "@/infra/payment/stripe";
import AppError from "@/shared/errors/AppError";
import prisma from "@/infra/database/database.config";
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

  async createStripeSession(cart: any, userId: string) {
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

    // Create line items with sellerId in metadata
    const lineItems = cart.cartItems.map((item: any) => {
      const imageUrl = validImage(safeImage(item.variant.product.images));
      const sellerId = item.variant.product.sellerId || "platform";

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${item.variant.product.name} (${item.variant.sku})`,
            images: [imageUrl],
            metadata: { 
              variantId: item.variantId,
              sellerId: sellerId,
            },
          },
          unit_amount: Math.round(item.variant.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const isProduction = process.env.NODE_ENV === "production";

    const clientUrl = isProduction
      ? process.env.CLIENT_URL_PROD
      : process.env.CLIENT_URL_DEV;

    // Store seller grouping in metadata for webhook processing
    const sellerGroups = Array.from(itemsBySeller.entries()).map(([sellerId, items]) => ({
      sellerId: sellerId === "platform" ? null : sellerId,
      itemCount: items.length,
      totalAmount: items.reduce((sum, item) => sum + item.quantity * item.variant.price, 0),
    }));

    // For multi-vendor, we need to use payment_intent with application_fee_amount
    // or use separate checkout sessions per seller
    // For simplicity, we'll use a single session with application fees
    
    // Calculate platform fee (e.g., 5% of total)
    const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || "5");
    const totalAmount = cart.cartItems.reduce(
      (sum: number, item: any) => sum + item.quantity * item.variant.price,
      0
    );
    const platformFee = Math.round((totalAmount * platformFeePercent / 100) * 100); // in cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "MX", "EG"],
      },
      mode: "payment",
      payment_intent_data: {
        application_fee_amount: platformFee,
        on_behalf_of: undefined, // Will be set per seller in webhook
        transfer_data: undefined, // Will be set per seller in webhook
      },
      success_url: `${clientUrl}/orders`,
      cancel_url: `${clientUrl}/cancel`,
      metadata: { 
        userId, 
        cartId: cart.id,
        sellerGroups: JSON.stringify(sellerGroups),
        platformFee: platformFee.toString(),
      },
    });

    return session;
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
