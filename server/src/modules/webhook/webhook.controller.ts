/**
 * WEBHOOK HANDLER - STRIPE PAYMENT MOCKING FOR TESTING
 * ====================================================
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
 *   - Webhook signature verification is skipped
 *   - Events are constructed from request body directly
 *   - Database updates still occur normally
 * 
 * After testing, restore real Stripe by setting TEST_PAYMENTS=false
 */

import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { WebhookService } from "./webhook.service";
import { makeLogsService } from "../logs/logs.factory";
import stripe from "@/infra/payment/stripe";
import AppError from "@/shared/errors/AppError";

const TEST_PAYMENTS = process.env.TEST_PAYMENTS === "true";

export class WebhookController {
  private logsService = makeLogsService();
  constructor(private webhookService: WebhookService) {}

  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    let event;

    if (TEST_PAYMENTS) {
      // MOCK MODE: Skip signature verification and construct event from body
      console.log("[MOCK WEBHOOK] Processing webhook in TEST MODE - signature verification skipped");

      // In test mode, expect the event type in the request body or header
      const eventType = req.body.type || req.headers["x-test-event-type"] || "checkout.session.completed";
      const eventData = req.body.data || { object: req.body };

      event = {
        id: `evt_mock_${Date.now()}`,
        object: "event",
        type: eventType,
        data: eventData,
        created: Math.floor(Date.now() / 1000),
      };

      this.logsService.info("Webhook - Mock event received (TEST MODE)", {
        eventType: event.type,
        eventId: event.id,
      });
    } else {
      // REAL MODE: Verify Stripe signature
      const sig = req.headers["stripe-signature"];
      if (!sig) throw new AppError(400, "No Stripe signature");

      // Real Stripe webhook signature verification
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        // Check if it's a seller subscription payment
        if (session.metadata?.type === "seller_subscription") {
          await this.webhookService.handleSellerSubscriptionPayment(session);
        } else {
          // Regular product purchase
          await this.webhookService.handleCheckoutCompletion(session);
        }
        break;

      case "account.updated":
        // Handle Stripe Connect account updates
        await this.webhookService.handleConnectAccountUpdate(event.data.object);
        break;

      case "transfer.created":
      case "transfer.paid":
        // Handle seller payouts
        await this.webhookService.handleSellerPayout(event.data.object);
        break;

      default:
        this.logsService.info("Webhook - Unhandled event type", {
          eventType: event.type,
        });
    }

    sendResponse(res, 200, { message: "Webhook received successfully" });
  });

  handleJazzCashCallback = asyncHandler(async (req: Request, res: Response) => {
    const callbackData = req.body;

    this.logsService.info("JazzCash callback received", {
      txnRefNo: callbackData.pp_TxnRefNo,
      responseCode: callbackData.pp_ResponseCode,
    });

    try {
      const result = await this.webhookService.handleJazzCashCallback(callbackData);

      if (result.status === 'completed') {
        // Redirect to success page
        const isProduction = process.env.NODE_ENV === "production";
        const clientUrl = isProduction
          ? process.env.CLIENT_URL_PROD
          : process.env.CLIENT_URL_DEV;

        res.redirect(`${clientUrl}/success?type=payment`);
      } else {
        // Redirect to failure page
        const isProduction = process.env.NODE_ENV === "production";
        const clientUrl = isProduction
          ? process.env.CLIENT_URL_PROD
          : process.env.CLIENT_URL_DEV;

        res.redirect(`${clientUrl}/failure?reason=payment_failed`);
      }
    } catch (error) {
      this.logsService.error("JazzCash callback processing failed", {
        error: error instanceof Error ? error.message : 'Unknown error',
        callbackData: JSON.stringify(callbackData),
      });

      // Redirect to failure page on error
      const isProduction = process.env.NODE_ENV === "production";
      const clientUrl = isProduction
        ? process.env.CLIENT_URL_PROD
        : process.env.CLIENT_URL_DEV;

      res.redirect(`${clientUrl}/failure?reason=processing_error`);
    }
  });
}