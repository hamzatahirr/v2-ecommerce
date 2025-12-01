/**
 * STRIPE PAYMENT MOCKING FOR TESTING
 * ===================================
 * 
 * This file has been modified to support test mode payments.
 * 
 * TO ENABLE MOCK PAYMENTS:
 *   Set TEST_PAYMENTS=true in your .env file
 * 
 * TO RESTORE REAL STRIPE:
 *   Set TEST_PAYMENTS=false or remove the variable from .env
 * 
 * When TEST_PAYMENTS=true:
 *   - All Stripe API calls are mocked
 *   - Payments complete instantly without contacting Stripe
 *   - Webhook events are simulated
 *   - Database updates still occur normally
 * 
 * After testing, restore real Stripe by setting TEST_PAYMENTS=false
 */

import Stripe from "stripe";

const TEST_PAYMENTS = process.env.TEST_PAYMENTS === "true";

// Real Stripe client (commented out when TEST_PAYMENTS=true)
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-03-31.basil",
// });

// Mock Stripe client for testing
const createMockStripe = () => {
  const mockId = (prefix: string) => `${prefix}_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  return {
    checkout: {
      sessions: {
        create: async (params: any) => {
          console.log("[MOCK STRIPE] Creating checkout session (TEST MODE)");
          return {
            id: mockId("cs"),
            object: "checkout.session",
            url: `${params.success_url?.split('?')[0] || 'http://localhost:3000'}/test-checkout?session_id=${mockId("cs")}`,
            status: "open",
            payment_status: "unpaid",
            mode: params.mode || "payment",
            payment_method_types: params.payment_method_types || ["card"],
            customer_details: null,
            line_items: { data: [] },
            amount_total: params.line_items?.reduce((sum: number, item: any) => {
              return sum + (item.price_data?.unit_amount || 0) * (item.quantity || 1);
            }, 0) || 0,
            metadata: params.metadata || {},
            success_url: params.success_url,
            cancel_url: params.cancel_url,
          };
        },
        retrieve: async (sessionId: string, options?: any) => {
          console.log("[MOCK STRIPE] Retrieving checkout session (TEST MODE):", sessionId);
          // In test mode, we'll return a completed session
          // Note: The actual metadata should be passed from the webhook handler
          // This is a fallback that will be overridden by webhook.service.ts
          return {
            id: sessionId,
            object: "checkout.session",
            status: "complete",
            payment_status: "paid",
            mode: "payment",
            payment_method_types: ["card"],
            customer_details: {
              email: "test@example.com",
              address: {
                line1: "123 Test St",
                city: "Test City",
                state: "TS",
                country: "US",
                postal_code: "12345",
              },
            },
            line_items: {
              data: options?.expand?.includes("line_items") ? [] : undefined,
            },
            amount_total: 9999, // Default mock amount in cents
            metadata: {}, // Will be populated by webhook handler in test mode
            customer: null,
          };
        },
      },
    },
    accounts: {
      create: async (params: any) => {
        console.log("[MOCK STRIPE] Creating Connect account (TEST MODE)");
        const accountId = mockId("acct");
        return {
          id: accountId,
          object: "account",
          type: params.type || "express",
          country: params.country || "US",
          email: params.email,
          capabilities: {
            card_payments: { status: "active", requested: true },
            transfers: { status: "active", requested: true },
          },
          details_submitted: false,
          charges_enabled: false,
          payouts_enabled: false,
          metadata: params.metadata || {},
        };
      },
      retrieve: async (accountId: string) => {
        console.log("[MOCK STRIPE] Retrieving Connect account (TEST MODE):", accountId);
        return {
          id: accountId,
          object: "account",
          type: "express",
          country: "US",
          details_submitted: true,
          charges_enabled: true,
          payouts_enabled: true,
          capabilities: {
            card_payments: { status: "active" },
            transfers: { status: "active" },
          },
        };
      },
      createLoginLink: async (accountId: string) => {
        console.log("[MOCK STRIPE] Creating login link (TEST MODE):", accountId);
        return {
          object: "login_link",
          created: Math.floor(Date.now() / 1000),
          url: `https://dashboard.stripe.com/test/login/${accountId}`,
        };
      },
    },
    accountLinks: {
      create: async (params: any) => {
        console.log("[MOCK STRIPE] Creating account link (TEST MODE)");
        return {
          object: "account_link",
          created: Math.floor(Date.now() / 1000),
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          url: `${params.return_url || 'http://localhost:3000'}/seller/onboarding/success?mock=true`,
        };
      },
    },
    webhooks: {
      constructEvent: (payload: any, signature: string, secret: string) => {
        console.log("[MOCK STRIPE] Constructing webhook event (TEST MODE) - signature verification skipped");
        // Return a mock event - the actual event type will be determined by the caller
        return {
          id: mockId("evt"),
          object: "event",
          type: "checkout.session.completed", // Default, can be overridden
          data: {
            object: {},
          },
          created: Math.floor(Date.now() / 1000),
        };
      },
    },
  } as any;
};

const stripe = TEST_PAYMENTS ? createMockStripe() : new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

if (TEST_PAYMENTS) {
  console.log("⚠️  [STRIPE] TEST MODE ENABLED - All payments are mocked. Set TEST_PAYMENTS=false to use real Stripe.");
}

export default stripe;
