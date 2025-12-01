import { Request, Response } from "express";
import { SellerService } from "./seller.service";
import { SellerStripeService } from "./seller-stripe.service";
import { SellerAnalyticsService } from "./seller-analytics.service";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { makeLogsService } from "../logs/logs.factory";
import AppError from "@/shared/errors/AppError";

export class SellerController {
  private logsService = makeLogsService();
  private stripeService = new SellerStripeService();
  private analyticsService = new SellerAnalyticsService();
  constructor(private sellerService: SellerService) {}

  applyToBecomeSeller = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      const sellerProfile = await this.sellerService.applyToBecomeSeller(
        userId,
        req.body
      );

      sendResponse(res, 201, {
        data: { sellerProfile },
        message: "Seller application submitted successfully. Waiting for approval.",
      });

      this.logsService.info("Seller application submitted", {
        userId,
        sellerProfileId: sellerProfile.id,
      });
    }
  );

  getSellerProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const sellerProfile = await this.sellerService.getSellerProfile(id);

      sendResponse(res, 200, {
        data: { sellerProfile },
        message: "Seller profile fetched successfully",
      });
    }
  );

  getMySellerProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      const sellerProfile = await this.sellerService.getSellerProfileByUserId(
        userId
      );

      sendResponse(res, 200, {
        data: { sellerProfile },
        message: "Seller profile fetched successfully",
      });
    }
  );

  updateSellerProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      const sellerProfile = await this.sellerService.updateSellerProfile(
        userId,
        req.body
      );

      sendResponse(res, 200, {
        data: { sellerProfile },
        message: "Seller profile updated successfully",
      });

      this.logsService.info("Seller profile updated", {
        userId,
        sellerProfileId: sellerProfile.id,
      });
    }
  );

  getSellerStats = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      const stats = await this.sellerService.getSellerStatsByUserId(userId);

      sendResponse(res, 200, {
        data: { stats },
        message: "Seller statistics fetched successfully",
      });
    }
  );

  createConnectAccount = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      const account = await this.stripeService.createConnectAccount(userId);

      sendResponse(res, 201, {
        data: { accountId: account.id },
        message: "Stripe Connect account created successfully",
      });
    }
  );

  createOnboardingLink = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      const accountLink = await this.stripeService.createOnboardingLink(userId);

      sendResponse(res, 200, {
        data: { url: accountLink.url },
        message: "Onboarding link created successfully",
      });
    }
  );

  checkAccountStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      const status = await this.stripeService.checkAccountStatus(userId);

      sendResponse(res, 200, {
        data: status,
        message: "Account status retrieved successfully",
      });
    }
  );

  getDashboardLink = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      const loginLink = await this.stripeService.getDashboardLink(userId);

      sendResponse(res, 200, {
        data: { url: loginLink.url },
        message: "Dashboard link created successfully",
      });
    }
  );

  getPayouts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      const payouts = await this.sellerService.getSellerPayouts(userId);

      sendResponse(res, 200, {
        data: { payouts },
        message: "Payouts retrieved successfully",
      });
    }
  );

  getDashboardAnalytics = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      const { timePeriod, year, startDate, endDate } = req.query;

      const analytics = await this.analyticsService.getSellerDashboardAnalytics(
        userId,
        {
          timePeriod: timePeriod as string,
          year: year ? parseInt(year as string) : undefined,
          startDate: startDate as string,
          endDate: endDate as string,
        }
      );

      sendResponse(res, 200, {
        data: analytics,
        message: "Seller dashboard analytics retrieved successfully",
      });
    }
  );

  getProductPerformance = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      const { timePeriod, year, startDate, endDate } = req.query;

      const performance = await this.analyticsService.getSellerProductPerformance(
        userId,
        {
          timePeriod: timePeriod as string,
          year: year ? parseInt(year as string) : undefined,
          startDate: startDate as string,
          endDate: endDate as string,
        }
      );

      sendResponse(res, 200, {
        data: { products: performance },
        message: "Product performance retrieved successfully",
      });
    }
  );

  getReviewAnalytics = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      const analytics = await this.analyticsService.getSellerReviewAnalytics(
        userId
      );

      sendResponse(res, 200, {
        data: analytics,
        message: "Review analytics retrieved successfully",
      });
    }
  );
}

