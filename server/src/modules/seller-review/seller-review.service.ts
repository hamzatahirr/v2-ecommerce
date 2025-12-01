import AppError from "@/shared/errors/AppError";
import { SellerReviewRepository } from "./seller-review.repository";
import prisma from "@/infra/database/database.config";

export class SellerReviewService {
  constructor(private sellerReviewRepository: SellerReviewRepository) {}

  async createReview(
    reviewerId: string,
    data: {
      sellerId: string;
      rating: number;
      comment?: string;
      orderId?: string;
    }
  ) {
    // Validate rating
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
      throw new AppError(400, "Rating must be an integer between 1 and 5");
    }

    // Verify seller exists and is approved
    const seller = await prisma.user.findUnique({
      where: { id: data.sellerId },
      include: {
        sellerProfile: true,
      },
    });

    if (!seller || !seller.isSeller) {
      throw new AppError(404, "Seller not found");
    }

    if (seller.sellerStatus !== "APPROVED") {
      throw new AppError(400, "Cannot review a seller that is not approved");
    }

    // Prevent sellers from reviewing themselves
    if (reviewerId === data.sellerId) {
      throw new AppError(400, "Sellers cannot review themselves");
    }

    // Verify reviewer is not a seller (only buyers can review)
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
      select: { role: true, isSeller: true },
    });

    if (reviewer?.isSeller) {
      throw new AppError(400, "Sellers cannot review other sellers. Only buyers can submit reviews.");
    }

    // If orderId is provided, verify the order exists and belongs to the reviewer
    if (data.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        select: {
          id: true,
          userId: true,
          sellerId: true,
          status: true,
        },
      });

      if (!order) {
        throw new AppError(404, "Order not found");
      }

      if (order.userId !== reviewerId) {
        throw new AppError(403, "You can only review sellers for orders you placed");
      }

      if (order.sellerId !== data.sellerId) {
        throw new AppError(400, "Order does not belong to this seller");
      }

      // Optionally verify order is completed/delivered
      if (order.status !== "DELIVERED" && order.status !== "COMPLETED") {
        throw new AppError(
          400,
          "You can only review sellers after order completion"
        );
      }
    }

    // Check if review already exists for this seller and order (if orderId provided)
    const existingReview =
      await this.sellerReviewRepository.findReviewByReviewerAndSeller(
        reviewerId,
        data.sellerId,
        data.orderId
      );

    if (existingReview) {
      throw new AppError(
        400,
        "You have already reviewed this seller" +
          (data.orderId ? " for this order" : "")
      );
    }

    // Create review
    const review = await this.sellerReviewRepository.createReview({
      sellerId: data.sellerId,
      reviewerId,
      rating: data.rating,
      comment: data.comment,
      orderId: data.orderId,
    });

    // Update seller rating and review count
    await this.sellerReviewRepository.updateSellerRating(data.sellerId);

    return review;
  }

  async getReviewsBySellerId(
    sellerId: string,
    query: { page?: number; limit?: number }
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verify seller exists
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { isSeller: true },
    });

    if (!seller || !seller.isSeller) {
      throw new AppError(404, "Seller not found");
    }

    const reviews = await this.sellerReviewRepository.findReviewsBySellerId(
      sellerId,
      {
        skip,
        take: limit,
      }
    );

    const total = await this.sellerReviewRepository.countReviewsBySellerId(
      sellerId
    );
    const totalPages = Math.ceil(total / limit);

    return {
      reviews,
      total,
      totalPages,
      currentPage: page,
      resultsPerPage: limit,
    };
  }

  async deleteReview(id: string, userId: string, userRole?: string) {
    const review = await this.sellerReviewRepository.findReviewById(id);
    if (!review) {
      throw new AppError(404, "Review not found");
    }

    // Only the reviewer or ADMIN can delete
    if (userRole !== "ADMIN" && review.reviewerId !== userId) {
      throw new AppError(403, "You are not authorized to delete this review");
    }

    await this.sellerReviewRepository.deleteReview(id);

    // Update seller rating after deletion
    await this.sellerReviewRepository.updateSellerRating(review.sellerId);

    return { message: "Review deleted successfully" };
  }

  async getAverageRating(sellerId: string) {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: sellerId },
      select: {
        averageRating: true,
        reviewCount: true,
      },
    });

    if (!sellerProfile) {
      throw new AppError(404, "Seller profile not found");
    }

    return {
      averageRating: sellerProfile.averageRating,
      reviewCount: sellerProfile.reviewCount,
    };
  }
}

