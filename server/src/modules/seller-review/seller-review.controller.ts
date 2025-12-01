import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { SellerReviewService } from "./seller-review.service";
import { makeLogsService } from "../logs/logs.factory";
import AppError from "@/shared/errors/AppError";

export class SellerReviewController {
  private logsService = makeLogsService();
  constructor(private sellerReviewService: SellerReviewService) {}

  createReview = asyncHandler(async (req: Request, res: Response) => {
    const reviewerId = req.user?.id;
    if (!reviewerId) {
      throw new AppError(401, "User not authenticated");
    }

    // Prevent sellers from reviewing
    if (req.user?.isSeller) {
      throw new AppError(403, "Sellers cannot review other sellers. Only buyers can submit reviews.");
    }

    const { sellerId, rating, comment, orderId } = req.body;

    const review = await this.sellerReviewService.createReview(reviewerId, {
      sellerId,
      rating,
      comment,
      orderId,
    });

    sendResponse(res, 201, {
      data: review,
      message: "Seller review created successfully",
    });

    this.logsService.info("Seller review created", {
      reviewerId,
      sellerId,
      orderId,
      rating,
    });
  });

  getReviewsBySellerId = asyncHandler(
    async (req: Request, res: Response) => {
      const { sellerId } = req.params;
      const { page, limit } = req.query;

      const result = await this.sellerReviewService.getReviewsBySellerId(
        sellerId,
        {
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
        }
      );

      sendResponse(res, 200, {
        data: result,
        message: "Seller reviews fetched successfully",
      });
    }
  );

  getAverageRating = asyncHandler(async (req: Request, res: Response) => {
    const { sellerId } = req.params;

    const result = await this.sellerReviewService.getAverageRating(sellerId);

    sendResponse(res, 200, {
      data: result,
      message: "Average rating fetched successfully",
    });
  });

  deleteReview = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError(401, "User not authenticated");
    }

    const result = await this.sellerReviewService.deleteReview(
      id,
      userId,
      userRole
    );

    sendResponse(res, 200, {
      data: result,
      message: "Review deleted successfully",
    });

    this.logsService.info("Seller review deleted", {
      userId,
      reviewId: id,
    });
  });
}

