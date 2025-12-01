/**
 * WEBHOOK SERVICE - STRIPE PAYMENT MOCKING FOR TESTING
 * ====================================================
 * 
 * This file handles Stripe webhook events for payments and seller operations.
 * 
 * TO ENABLE MOCK PAYMENTS:
 *   Set TEST_PAYMENTS=true in your .env file
 * 
 * TO RESTORE REAL STRIPE:
 *   Set TEST_PAYMENTS=false or remove the variable from .env
 * 
 * When TEST_PAYMENTS=true:
 *   - Session retrieval calls are mocked
 *   - Mock session data is used for order processing
 *   - Database updates still occur normally
 *   - All logging is annotated with "(TEST MODE)"
 * 
 * After testing, restore real Stripe by setting TEST_PAYMENTS=false
 */

import {
  PrismaClient,
  PAYMENT_STATUS,
  TRANSACTION_STATUS,
  CART_STATUS,
  SELLER_STATUS,
  SUBSCRIPTION_STATUS,
} from "@prisma/client";
import stripe from "@/infra/payment/stripe";
import AppError from "@/shared/errors/AppError";
import redisClient from "@/infra/cache/redis";
import { makeLogsService } from "../logs/logs.factory";
import { CartService } from "../cart/cart.service";
import { CartRepository } from "../cart/cart.repository";
import { generateOrderNumber } from "@/shared/utils/generateOrderNumber";
import { SellerRepository } from "../seller/seller.repository";
import { makeWalletService } from "../wallet/wallet.factory";

const prisma = new PrismaClient();
const TEST_PAYMENTS = process.env.TEST_PAYMENTS === "true";

export class WebhookService {
  private logsService = makeLogsService();
  private repo = new CartRepository();
  private cartService = new CartService(this.repo);
  private sellerRepository = new SellerRepository();
  private walletService = makeWalletService();

  private async calculateOrderAmount(cart: any) {
    return cart.cartItems.reduce(
      (sum: number, item: any) => sum + item.variant.price * item.quantity,
      0
    );
  }

  async handleCheckoutCompletion(session: any) {
    let fullSession;
    if (TEST_PAYMENTS) {
      // MOCK MODE: Use session data directly or create mock session
      console.log("[MOCK WEBHOOK] Handling checkout completion in TEST MODE");
      fullSession = {
        ...session,
        id: session.id || `cs_mock_${Date.now()}`,
        status: "complete",
        payment_status: "paid",
        amount_total: session.amount_total || 0,
        customer_details: session.customer_details || {
          email: "test@example.com",
          address: {
            line1: "123 Test St",
            city: "Test City",
            state: "TS",
            country: "US",
            postal_code: "12345",
          },
        },
        metadata: session.metadata || {},
        line_items: session.line_items || { data: [] },
      };
      this.logsService.info("Webhook - Using mock session data (TEST MODE)", {
        sessionId: fullSession.id,
      });
    } else {
      // REAL MODE: Retrieve session from Stripe
      fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["customer_details", "line_items"],
      });
    }

    // Check if orders already exist for this session (using metadata)
    const existingOrders = await prisma.order.findMany({
      where: { 
        user: {
          id: fullSession?.metadata?.userId,
        },
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Within last 5 minutes
        },
      },
    });

    if (existingOrders.length > 0) {
      this.logsService.info("Webhook - Duplicate event ignored", {
        sessionId: session.id,
      });
      return {
        orders: existingOrders,
        payments: [],
        transactions: [],
        shipments: [],
        address: null,
      };
    }

    const userId = fullSession?.metadata?.userId;
    const cartId = fullSession?.metadata?.cartId;
    if (!userId || !cartId) {
      throw new AppError(400, "Missing userId or cartId in session metadata");
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { cartItems: { include: { variant: { include: { product: true } } } } },
    });
    if (!cart || cart.cartItems.length === 0) {
      throw new AppError(400, "Cart is empty or not found");
    }

    const amount = await this.calculateOrderAmount(cart);
    if (Math.abs(amount - (fullSession.amount_total ?? 0) / 100) > 0.01) {
      throw new AppError(400, "Amount mismatch between cart and session");
    }

    // Group cart items by sellerId
    const itemsBySeller = new Map<string, any[]>();
    for (const item of cart.cartItems) {
      const sellerId = item.variant.product.sellerId || null;
      const key = sellerId || "platform";
      if (!itemsBySeller.has(key)) {
        itemsBySeller.set(key, []);
      }
      itemsBySeller.get(key)!.push(item);
    }

    // Get customer address once
    const customerAddress = fullSession.customer_details?.address;

    const result = await prisma.$transaction(async (tx) => {
      // Validate stock
      for (const item of cart.cartItems) {
        if (item.variant.stock < item.quantity) {
          throw new AppError(400, `Insufficient stock for variant ${item.variant.sku}: only ${item.variant.stock} available`);
        }
      }

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
        let orderNumber = generateOrderNumber();
        // Ensure uniqueness
        let existingOrder = await tx.order.findUnique({
          where: { orderNumber },
        });
        while (existingOrder) {
          orderNumber = generateOrderNumber();
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
        if (!createdAddress && customerAddress) {
          createdAddress = await tx.address.create({
            data: {
              orderId: order.id,
              userId,
              city: customerAddress.city || "N/A",
              state: customerAddress.state || "N/A",
              country: customerAddress.country || "N/A",
              zip: customerAddress.postal_code || "N/A",
              street: customerAddress.line1 || "N/A",
            },
          });
        }

        // Create Payment for this seller's order
        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            userId,
            sellerId,
            method: fullSession.payment_method_types?.[0] || "unknown",
            amount: orderAmount,
            status: PAYMENT_STATUS.PAID,
          },
        });
        createdPayments.push(payment);

        // Create Transaction
        const transaction = await tx.transaction.create({
          data: {
            orderId: order.id,
            status: TRANSACTION_STATUS.PENDING,
            transactionDate: new Date(),
          },
        });
        createdTransactions.push(transaction);

        // Create Shipment
        const shipment = await tx.shipment.create({
          data: {
            orderId: order.id,
            carrier: "Carrier_" + Math.random().toString(36).substring(2, 10),
            trackingNumber: Math.random().toString(36).substring(2, 12).toUpperCase(),
            shippingNotes: null,
            shippedDate: new Date(),
            deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

        // Credit seller wallet after order creation (will be held for 7 days)
        // Note: This happens outside the transaction since wallet service has its own transactions
        setTimeout(async () => {
          try {
            await this.walletService.creditWalletAfterOrderConfirmation(
              order.id,
              sellerId,
              orderAmount
            );
            this.logsService.info("Wallet credited for order" + (TEST_PAYMENTS ? " (TEST MODE)" : ""), {
              orderId: order.id,
              sellerId,
              amount: orderAmount,
              testMode: TEST_PAYMENTS,
            });
          } catch (error) {
            this.logsService.error("Failed to credit wallet for order" + (TEST_PAYMENTS ? " (TEST MODE)" : ""), {
              orderId: order.id,
              sellerId,
              amount: orderAmount,
              error: error instanceof Error ? error.message : 'Unknown error',
              testMode: TEST_PAYMENTS,
            });
          }
        }, 100);
      }

      // Clear the Cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: { status: CART_STATUS.CONVERTED },
      });

      return { 
        orders: createdOrders, 
        payments: createdPayments, 
        transactions: createdTransactions, 
        shipments: createdShipments, 
        address: createdAddress 
      };
    });

    // Post-transaction actions
    await redisClient.del("dashboard:year-range");
    const keys = await redisClient.keys("dashboard:stats:*");
    if (keys.length > 0) await redisClient.del(keys);

    this.cartService.logCartEvent(cart.id, "CHECKOUT_COMPLETED", userId);

    this.logsService.info("Webhook - Orders processed successfully" + (TEST_PAYMENTS ? " (TEST MODE)" : ""), {
      userId,
      orderCount: result.orders.length,
      orderNumbers: result.orders.map((o: any) => o.orderNumber),
      amount,
      testMode: TEST_PAYMENTS,
    });

    return result;
  }

  /**
   * Handle seller subscription payment webhook
   */
  async handleSellerSubscriptionPayment(session: any) {
    let fullSession;
    if (TEST_PAYMENTS) {
      // MOCK MODE: Use session data directly or create mock session
      console.log("[MOCK WEBHOOK] Handling seller subscription payment in TEST MODE");
      fullSession = {
        ...session,
        id: session.id || `cs_mock_${Date.now()}`,
        status: "complete",
        payment_status: "paid",
        amount_total: session.amount_total || 999, // Default $9.99 in cents
        customer: session.customer || `cus_mock_${Date.now()}`,
        customer_details: session.customer_details || {
          email: "test@example.com",
        },
        metadata: session.metadata || {},
        line_items: session.line_items || { data: [] },
      };
      this.logsService.info("Webhook - Using mock subscription session data (TEST MODE)", {
        sessionId: fullSession.id,
      });
    } else {
      // REAL MODE: Retrieve session from Stripe
      fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["customer_details", "line_items"],
      });
    }

    const userId = fullSession?.metadata?.userId;
    if (!userId) {
      throw new AppError(400, "Missing userId in session metadata");
    }

    const metadata = fullSession.metadata;
    const subscriptionAmount = fullSession.amount_total / 100;

    const result = await prisma.$transaction(async (tx) => {
      let sellerProfile = await tx.sellerProfile.findUnique({
        where: { userId },
      });

      if (!sellerProfile) {
        sellerProfile = await tx.sellerProfile.create({
          data: {
            userId,
            storeName: metadata.storeName || "My Store",
            storeDescription: metadata.storeDescription || null,
            phone: metadata.phone || null,
            address: metadata.address || null,
            city: metadata.city || null,
            state: metadata.state || null,
            country: metadata.country || null,
            zipCode: metadata.zipCode || null,
          },
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          isSeller: true,
          sellerStatus: SELLER_STATUS.PENDING_APPROVAL,
        },
      });

      const subscription = await tx.sellerSubscription.create({
        data: {
          sellerId: userId,
          planName: "One-time Seller Fee",
          amount: subscriptionAmount,
          status: SUBSCRIPTION_STATUS.ACTIVE,
          startDate: new Date(),
          stripeCustomerId: fullSession.customer as string | null,
        },
      });

      return { sellerProfile, subscription };
    });

    this.logsService.info("Webhook - Seller subscription payment processed" + (TEST_PAYMENTS ? " (TEST MODE)" : ""), {
      userId,
      sessionId: session.id,
      amount: subscriptionAmount,
      testMode: TEST_PAYMENTS,
    });

    return result;
  }

  /**
   * Handle Stripe Connect account updates
   */
  async handleConnectAccountUpdate(account: any) {
    const userId = account.metadata?.userId;
    if (!userId) {
      this.logsService.info("Webhook - Connect account update without userId", {
        accountId: account.id,
      });
      return;
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!sellerProfile || sellerProfile.stripeAccountId !== account.id) {
      return;
    }

    const isComplete =
      account.details_submitted &&
      account.charges_enabled &&
      account.payouts_enabled;

    await prisma.sellerProfile.update({
      where: { userId },
      data: { stripeOnboardingComplete: isComplete },
    });

    this.logsService.info("Webhook - Connect account updated" + (TEST_PAYMENTS ? " (TEST MODE)" : ""), {
      userId,
      accountId: account.id,
      isComplete,
      testMode: TEST_PAYMENTS,
    });
  }

  /**
   * Handle seller payout webhooks
   */
  async handleSellerPayout(transfer: any) {
    const accountId = transfer.destination;
    if (!accountId) {
      return;
    }

    const sellerProfile = await prisma.sellerProfile.findFirst({
      where: { stripeAccountId: accountId },
    });

    if (!sellerProfile) {
      this.logsService.info("Webhook - Payout for unknown account", {
        accountId,
        transferId: transfer.id,
      });
      return;
    }

    await prisma.sellerPayout.create({
      data: {
        sellerId: sellerProfile.userId,
        amount: transfer.amount / 100,
        currency: transfer.currency || "usd",
        status: transfer.reversed ? "REVERSED" : transfer.status === "paid" ? "PAID" : "PENDING",
        stripeTransferId: transfer.id,
        payoutDate: transfer.status === "paid" ? new Date() : null,
      },
    });

    if (transfer.status === "paid" && !transfer.reversed) {
      await prisma.sellerProfile.update({
        where: { userId: sellerProfile.userId },
        data: {
          totalEarnings: {
            increment: transfer.amount / 100,
          },
        },
      });
    }

    this.logsService.info("Webhook - Seller payout processed" + (TEST_PAYMENTS ? " (TEST MODE)" : ""), {
      sellerId: sellerProfile.userId,
      transferId: transfer.id,
      amount: transfer.amount / 100,
      status: transfer.status,
      testMode: TEST_PAYMENTS,
    });
  }
}