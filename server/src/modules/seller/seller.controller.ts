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

      sendResponse(res, 200, {
        data: await this.sellerService.getSellerStats(userId),
        message: "Seller stats retrieved successfully",
      });
      this.logsService.info("Seller stats retrieved", {
        userId,
      });
    }
  );

  getSellerOrders = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      const { page = 1, limit = 10, status } = req.query;

      const orders = await this.sellerService.getSellerOrders(
        userId,
        {
          page: parseInt(page as string) || 1,
          limit: parseInt(limit as string) || 10,
          status: status as string,
        }
      );

      sendResponse(res, 200, {
        data: { orders },
        message: "Orders retrieved successfully",
      });
      this.logsService.info("Seller orders retrieved", {
        userId,
        page,
        limit,
        status,
      });
    }
  );

  createConnectAccount = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      // Stripe Connect account creation disabled
      const account = { id: 'mock_account_id' };

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

      const status = await this.stripeService.getDashboardLink(userId);

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

  getSellerOrder = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      const { orderId } = req.params;
      
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      if (!orderId) {
        throw new AppError(400, "Order ID is required");
      }

      const order = await this.sellerService.getSellerOrder(userId, orderId);

      sendResponse(res, 200, {
        data: { order },
        message: "Order retrieved successfully",
      });

      this.logsService.info("Seller order retrieved", {
        userId,
        orderId,
      });
    }
  );

  updateOrderStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      const { orderId } = req.params;
      const { status } = req.body;
      
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      if (!orderId) {
        throw new AppError(400, "Order ID is required");
      }

      if (!status) {
        throw new AppError(400, "Status is required");
      }

      const updatedOrder = await this.sellerService.updateSellerOrderStatus(userId, orderId, status);

      sendResponse(res, 200, {
        data: { order: updatedOrder },
        message: "Order status updated successfully",
      });

      this.logsService.info("Seller order status updated", {
        userId,
        orderId,
        status,
      });
    }
  );

  updateShippingInfo = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      const { orderId } = req.params;
      const { trackingNumber, shippingNotes } = req.body;
      
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      if (!orderId) {
        throw new AppError(400, "Order ID is required");
      }

      const shippingInfo = {
        trackingNumber,
        shippingNotes,
      };

      const updatedOrder = await this.sellerService.updateSellerOrderShipping(userId, orderId, shippingInfo);

      sendResponse(res, 200, {
        data: { order: updatedOrder },
        message: "Shipping information updated successfully",
      });

      this.logsService.info("Seller order shipping info updated", {
        userId,
        orderId,
        trackingNumber,
      });
    }
  );
}

