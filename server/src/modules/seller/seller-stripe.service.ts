/**
 * SELLER STRIPE SERVICE - STRIPE CONNECT MOCKING FOR TESTING
 * ===========================================================
 * 
 * This file handles Stripe Connect operations for seller onboarding.
 * 
 * TO ENABLE MOCK PAYMENTS:
 *   Set TEST_PAYMENTS=true in your .env file
 *   The stripe client in @/infra/payment/stripe will automatically use mocks
 * 
 * TO RESTORE REAL STRIPE:
 *   Set TEST_PAYMENTS=false or remove the variable from .env
 * 
 * When TEST_PAYMENTS=true:
 *   - Connect accounts are created with mock IDs
 *   - Onboarding links return mock URLs
 *   - Account status checks return mock data
 *   - Dashboard links return mock URLs
 *   - No actual Stripe API calls are made
 *   - Database updates still occur normally
 * 
 * After testing, restore real Stripe by setting TEST_PAYMENTS=false
 */

import stripe from "@/infra/payment/stripe";
import AppError from "@/shared/errors/AppError";
import prisma from "@/infra/database/database.config";

export class SellerStripeService {
  /**
   * Get seller's Stripe Connect account dashboard link
   */
  async getDashboardLink(userId: string) {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!sellerProfile) {
      throw new AppError(400, "Seller profile not found");
    }

    // Mock account link when bypass mode is enabled
    if (process.env.PAYMENT_BYPASS === 'true') {
      return {
        url: `${process.env.CLIENT_URL_PROD || process.env.CLIENT_URL_DEV}/seller/dashboard`,
        type: 'account_onboarding',
      };
    }

    // Return false for non-bypass mode when no account exists
    return {
      hasAccount: false,
      isReady: false,
      detailsSubmitted: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    };
  }

  /**
   * Create Stripe Connect onboarding link
   */
  async createOnboardingLink(userId: string) {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!sellerProfile) {
      throw new AppError(400, "Seller profile not found. Please create a seller profile first.");
    }

    const isProduction = process.env.NODE_ENV === "production";
    const clientUrl = isProduction
      ? process.env.CLIENT_URL_PROD
      : process.env.CLIENT_URL_DEV;
    
    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: sellerProfile.id, // Use seller profile ID instead
      refresh_url: `${clientUrl}/seller/onboarding/refresh`,
      return_url: `${clientUrl}/seller/onboarding/success`,
      type: "account_onboarding",
    });

    return accountLink;
  }
}

