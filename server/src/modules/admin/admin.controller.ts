import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import { SellerAnalyticsService } from "../seller/seller-analytics.service";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { makeLogsService } from "../logs/logs.factory";
import AppError from "@/shared/errors/AppError";

export class AdminController {
  private logsService = makeLogsService();
  private sellerAnalyticsService = new SellerAnalyticsService();
  constructor(private adminService: AdminService) {}

  getPendingSellers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.adminService.getPendingSellers(page, limit);

      sendResponse(res, 200, {
        data: result,
        message: "Pending sellers fetched successfully",
      });

      this.logsService.info("Pending sellers fetched", {
        userId: req.user?.id,
        page,
        limit,
      });
    }
  );

  getAllSellers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const filters = {
        status: req.query.status as any,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await this.adminService.getAllSellers(filters);

      sendResponse(res, 200, {
        data: result,
        message: "Sellers fetched successfully",
      });

      this.logsService.info("All sellers fetched", {
        userId: req.user?.id,
        filters,
      });
    }
  );

  approveSeller = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const seller = await this.adminService.approveSeller(id);

      sendResponse(res, 200, {
        data: { seller },
        message: "Seller approved successfully",
      });

      this.logsService.info("Seller approved", {
        adminId: req.user?.id,
        sellerId: id,
      });
    }
  );

  rejectSeller = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const seller = await this.adminService.rejectSeller(id);

      sendResponse(res, 200, {
        data: { seller },
        message: "Seller rejected successfully",
      });

      this.logsService.info("Seller rejected", {
        adminId: req.user?.id,
        sellerId: id,
      });
    }
  );

  suspendSeller = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const seller = await this.adminService.suspendSeller(id);

      sendResponse(res, 200, {
        data: { seller },
        message: "Seller suspended successfully",
      });

      this.logsService.info("Seller suspended", {
        adminId: req.user?.id,
        sellerId: id,
      });
    }
  );

  getAggregatedSellerAnalytics = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { timePeriod, year, startDate, endDate } = req.query;

      const analytics =
        await this.sellerAnalyticsService.getAggregatedSellerAnalytics({
          timePeriod: timePeriod as string,
          year: year ? parseInt(year as string) : undefined,
          startDate: startDate as string,
          endDate: endDate as string,
        });

      sendResponse(res, 200, {
        data: { sellers: analytics },
        message: "Aggregated seller analytics retrieved successfully",
      });

      this.logsService.info("Aggregated seller analytics fetched", {
        adminId: req.user?.id,
      });
    }
  );
}

