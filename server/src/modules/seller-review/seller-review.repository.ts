import prisma from "@/infra/database/database.config";

export class SellerReviewRepository {
  async createReview(data: {
    sellerId: string;
    reviewerId: string;
    rating: number;
    comment?: string;
    orderId?: string;
  }) {
    return prisma.sellerReview.create({ data });
  }

  async findReviewsBySellerId(
    sellerId: string,
    params: {
      skip?: number;
      take?: number;
    }
  ) {
    const { skip = 0, take = 10 } = params;
    return prisma.sellerReview.findMany({
      where: { sellerId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            sellerProfile: {
              select: {
                storeName: true,
                storeLogo: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  }

  async findReviewById(id: string) {
    return prisma.sellerReview.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findReviewByReviewerAndSeller(
    reviewerId: string,
    sellerId: string,
    orderId?: string
  ) {
    const where: any = {
      reviewerId,
      sellerId,
    };
    if (orderId) {
      where.orderId = orderId;
    }
    return prisma.sellerReview.findFirst({
      where,
    });
  }

  async deleteReview(id: string) {
    return prisma.sellerReview.delete({
      where: { id },
    });
  }

  async updateSellerRating(sellerId: string) {
    const reviews = await prisma.sellerReview.findMany({
      where: { sellerId },
      select: { rating: true },
    });
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    // Update seller profile
    await prisma.sellerProfile.update({
      where: { userId: sellerId },
      data: {
        averageRating,
        reviewCount,
      },
    });

    return { averageRating, reviewCount };
  }

  async countReviewsBySellerId(sellerId: string) {
    return prisma.sellerReview.count({
      where: { sellerId },
    });
  }
}

