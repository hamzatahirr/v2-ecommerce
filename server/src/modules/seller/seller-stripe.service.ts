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
   * Create a Stripe Connect account for seller onboarding
   */
  async createConnectAccount(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!sellerProfile) {
      throw new AppError(404, "Seller profile not found. Please apply to become a seller first.");
    }

    if (sellerProfile.stripeAccountId) {
      throw new AppError(400, "Stripe Connect account already exists");
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: "express",
      country: sellerProfile.country || "US",
      email: user.email || undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        userId,
        sellerProfileId: sellerProfile.id,
      },
    });

    // Update seller profile with Stripe account ID
    await prisma.sellerProfile.update({
      where: { userId },
      data: { stripeAccountId: account.id },
    });

    return account;
  }

  /**
   * Create Stripe Connect onboarding link
   */
  async createOnboardingLink(userId: string) {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { stripeAccountId: true },
    });

    if (!sellerProfile || !sellerProfile.stripeAccountId) {
      throw new AppError(400, "Stripe Connect account not found. Please create an account first.");
    }

    const isProduction = process.env.NODE_ENV === "production";
    const clientUrl = isProduction
      ? process.env.CLIENT_URL_PROD
      : process.env.CLIENT_URL_DEV;

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: sellerProfile.stripeAccountId,
      refresh_url: `${clientUrl}/seller/onboarding/refresh`,
      return_url: `${clientUrl}/seller/onboarding/success`,
      type: "account_onboarding",
    });

    return accountLink;
  }

  /**
   * Check if seller's Stripe Connect account is ready to receive payments
   */
  async checkAccountStatus(userId: string) {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { stripeAccountId: true, stripeOnboardingComplete: true },
    });

    if (!sellerProfile || !sellerProfile.stripeAccountId) {
      return {
        hasAccount: false,
        isReady: false,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      };
    }

    const account = await stripe.accounts.retrieve(sellerProfile.stripeAccountId);

    // Type assertion for Stripe account properties
    const detailsSubmitted = (account as any).details_submitted ?? false;
    const chargesEnabled = (account as any).charges_enabled ?? false;
    const payoutsEnabled = (account as any).payouts_enabled ?? false;

    const isReady = detailsSubmitted && chargesEnabled && payoutsEnabled;

    // Update seller profile if onboarding is complete
    if (isReady && !sellerProfile.stripeOnboardingComplete) {
      await prisma.sellerProfile.update({
        where: { userId },
        data: { stripeOnboardingComplete: true },
      });
    }

    return {
      hasAccount: true,
      isReady,
      detailsSubmitted,
      chargesEnabled,
      payoutsEnabled,
      accountId: account.id,
    };
  }

  /**
   * Get seller's Stripe Connect account dashboard link
   */
  async getDashboardLink(userId: string) {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { stripeAccountId: true },
    });

    if (!sellerProfile || !sellerProfile.stripeAccountId) {
      throw new AppError(400, "Stripe Connect account not found");
    }

    const loginLink = await stripe.accounts.createLoginLink(
      sellerProfile.stripeAccountId
    );

    return loginLink;
  }
}

