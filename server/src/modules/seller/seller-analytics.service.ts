import prisma from "@/infra/database/database.config";
import AppError from "@/shared/errors/AppError";
import {
  getDateRange,
  calculateMetrics,
  calculateChanges,
  aggregateMonthlyTrends,
  shouldFetchPreviousPeriod,
} from "@/shared/utils/analytics";

export interface SellerAnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalSales: number;
  totalCustomers: number;
  averageOrderValue: number;
  averageRating: number;
  reviewCount: number;
  totalProducts: number;
  changes: {
    revenue: number | null;
    orders: number | null;
    sales: number | null;
    customers: number | null;
    averageOrderValue: number | null;
  };
  monthlyTrends: {
    labels: string[];
    revenue: number[];
    orders: number[];
    sales: number[];
    customers: number[];
  };
}

export interface SellerProductPerformance {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface SellerReviewAnalytics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
  };
  recentReviews: Array<{
    id: string;
    reviewerName: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
  }>;
}

export class SellerAnalyticsService {
  /**
   * Get comprehensive seller dashboard analytics
   */
  async getSellerDashboardAnalytics(
    sellerId: string,
    query: {
      timePeriod?: string;
      year?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<SellerAnalyticsOverview> {
    // Verify seller exists
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: sellerId },
    });

    if (!sellerProfile) {
      throw new AppError(404, "Seller profile not found");
    }

    // Validate endDate if provided
    let endDate: Date | undefined;
    if (query.endDate) {
      const parsedDate = new Date(query.endDate);
      if (isNaN(parsedDate.getTime())) {
        throw new AppError(400, "Invalid endDate format");
      }
      endDate = parsedDate;
    }

    const {
      currentStartDate,
      previousStartDate,
      previousEndDate,
      yearStart,
      yearEnd,
    } = getDateRange({
      timePeriod: query.timePeriod,
      year: query.year,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    // Fetch current period data
    const [currentOrders, currentOrderItems, currentProducts, currentReviews] =
      await Promise.all([
        prisma.order.findMany({
          where: {
            sellerId,
            orderDate: {
              gte: currentStartDate,
              lte: endDate || new Date(),
            },
          },
          include: {
            orderItems: {
              where: { sellerId },
            },
            user: {
              select: { id: true },
            },
          },
        }),
        prisma.orderItem.findMany({
          where: {
            sellerId,
            createdAt: {
              gte: currentStartDate,
              lte: endDate || new Date(),
            },
          },
          include: {
            variant: {
              include: {
                product: {
                  select: { name: true },
                },
              },
            },
          },
        }),
        prisma.product.count({
          where: { sellerId },
        }),
        prisma.sellerReview.findMany({
          where: { sellerId },
        }),
      ]);

    // Fetch previous period data for comparison
    const fetchPrevious = shouldFetchPreviousPeriod(query.timePeriod || "allTime");
    const [previousOrders, previousOrderItems] = fetchPrevious
      ? await Promise.all([
          prisma.order.findMany({
            where: {
              sellerId,
              orderDate: {
                gte: previousStartDate,
                lte: previousEndDate,
              },
            },
            include: {
              orderItems: {
                where: { sellerId },
              },
            },
          }),
          prisma.orderItem.findMany({
            where: {
              sellerId,
              createdAt: {
                gte: previousStartDate,
                lte: previousEndDate,
              },
            },
          }),
        ])
      : [[], []];

    // Calculate metrics
    const currentMetrics = calculateMetrics(
      currentOrders,
      currentOrderItems,
      []
    );
    const previousMetrics = calculateMetrics(
      previousOrders,
      previousOrderItems,
      []
    );

    // Calculate unique customers
    const uniqueCustomers = new Set(
      currentOrders.map((order) => order.userId)
    ).size;
    const prevUniqueCustomers = new Set(
      previousOrders.map((order) => order.userId)
    ).size;

    // Calculate review metrics
    const averageRating =
      currentReviews.length > 0
        ? currentReviews.reduce((sum, review) => sum + review.rating, 0) /
          currentReviews.length
        : 0;

    // Calculate changes
    const changes = calculateChanges(
      {
        ...currentMetrics,
        totalUsers: uniqueCustomers,
      },
      {
        ...previousMetrics,
        totalUsers: prevUniqueCustomers,
      },
      fetchPrevious
    );

    // Get monthly trends
    const uniqueCustomersList = Array.from(
      new Set(currentOrders.map((order) => order.userId))
    ).map((id) => ({ id, createdAt: currentStartDate })); // Simplified for trends
    const monthlyTrends = aggregateMonthlyTrends(
      currentOrders,
      currentOrderItems,
      uniqueCustomersList
    );

    return {
      totalRevenue: currentMetrics.totalRevenue,
      totalOrders: currentMetrics.totalOrders,
      totalSales: currentMetrics.totalSales,
      totalCustomers: uniqueCustomers,
      averageOrderValue: currentMetrics.averageOrderValue,
      averageRating,
      reviewCount: currentReviews.length,
      totalProducts: currentProducts,
      changes: {
        revenue: changes.revenue,
        orders: changes.orders,
        sales: changes.sales,
        customers:
          prevUniqueCustomers > 0
            ? ((uniqueCustomers - prevUniqueCustomers) /
                prevUniqueCustomers) *
              100
            : null,
        averageOrderValue: changes.averageOrderValue,
      },
      monthlyTrends,
    };
  }

  /**
   * Get seller product performance analytics
   */
  async getSellerProductPerformance(
    sellerId: string,
    query: {
      timePeriod?: string;
      year?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<any> {
    // Verify seller exists
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: sellerId },
    });

    if (!sellerProfile) {
      throw new AppError(404, "Seller profile not found");
    }

    // Validate endDate if provided
    let endDate: Date | undefined;
    if (query.endDate) {
      const parsedDate = new Date(query.endDate);
      if (isNaN(parsedDate.getTime())) {
        throw new AppError(400, "Invalid endDate format");
      }
      endDate = parsedDate;
    }

    const {
      currentStartDate,
      yearStart,
      yearEnd,
    } = getDateRange({
      timePeriod: query.timePeriod,
      year: query.year,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    const orderItems = await prisma.orderItem.findMany({
      where: {
        sellerId,
        createdAt: {
          gte: currentStartDate,
          lte: endDate || new Date(),
        },
      },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Aggregate by product
    const productMap = new Map<string, SellerProductPerformance>();

    orderItems.forEach((item) => {
      const productId = item.variant.product.id;
      const productName = item.variant.product.name;
      const quantity = item.quantity;
      const revenue = item.price * item.quantity;

      if (productMap.has(productId)) {
        const existing = productMap.get(productId)!;
        existing.quantity += quantity;
        existing.revenue += revenue;
      } else {
        productMap.set(productId, {
          productId,
          productName,
          quantity,
          revenue,
        });
      }
    });

    return Array.from(productMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );
  }

  /**
   * Get seller review analytics
   */
  async getSellerReviewAnalytics(
    sellerId: string
  ): Promise<SellerReviewAnalytics> {
    const reviews = await prisma.sellerReview.findMany({
      where: { sellerId },
      include: {
        reviewer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10, // Recent reviews
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    // Rating distribution
    const distribution = {
      "5": 0,
      "4": 0,
      "3": 0,
      "2": 0,
      "1": 0,
    };

    reviews.forEach((review) => {
      const rating = review.rating.toString() as keyof typeof distribution;
      if (distribution[rating] !== undefined) {
        distribution[rating]++;
      }
    });

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution: distribution,
      recentReviews: reviews.slice(0, 10).map((review) => ({
        id: review.id,
        reviewerName: review.reviewer.name || "Anonymous",
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
    };
  }

  /**
   * Get aggregated analytics for all sellers (admin view)
   */
  async getAggregatedSellerAnalytics(query: {
    timePeriod?: string;
    year?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<
    Array<{
      sellerId: string;
      sellerName: string;
      storeName: string;
      totalRevenue: number;
      totalOrders: number;
      totalSales: number;
      averageRating: number;
      reviewCount: number;
      totalProducts: number;
    }>
  > {
    // Validate endDate if provided
    let endDate: Date | undefined;
    if (query.endDate) {
      const parsedDate = new Date(query.endDate);
      if (isNaN(parsedDate.getTime())) {
        throw new AppError(400, "Invalid endDate format");
      }
      endDate = parsedDate;
    }

    const {
      currentStartDate,
      yearStart,
      yearEnd,
    } = getDateRange({
      timePeriod: query.timePeriod,
      year: query.year,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    // Get all sellers with their profiles
    const sellers = await prisma.user.findMany({
      where: {
        isSeller: true,
        sellerStatus: "APPROVED",
      },
      include: {
        sellerProfile: true,
      },
    });

    // Get analytics for each seller
    const sellerAnalytics = await Promise.all(
      sellers.map(async (seller) => {
        const [orders, orderItems, products, reviews] = await Promise.all([
          prisma.order.findMany({
            where: {
              sellerId: seller.id,
              orderDate: {
                gte: currentStartDate,
                lte: endDate || new Date(),
              },
            },
            include: {
              orderItems: {
                where: { sellerId: seller.id },
              },
            },
          }),
          prisma.orderItem.findMany({
            where: {
              sellerId: seller.id,
              createdAt: {
                gte: currentStartDate,
                lte: endDate || new Date(),
              },
            },
          }),
          prisma.product.count({
            where: { sellerId: seller.id },
          }),
          prisma.sellerReview.findMany({
            where: { sellerId: seller.id },
          }),
        ]);

        const metrics = calculateMetrics(orders, orderItems, []);
        const uniqueCustomers = new Set(orders.map((order) => order.userId))
          .size;
        const averageRating =
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            : 0;

        return {
          sellerId: seller.id,
          sellerName: seller.name,
          storeName: seller.sellerProfile?.storeName || "N/A",
          totalRevenue: metrics.totalRevenue,
          totalOrders: metrics.totalOrders,
          totalSales: metrics.totalSales,
          totalCustomers: uniqueCustomers,
          averageRating,
          reviewCount: reviews.length,
          totalProducts: products,
        };
      })
    );

    return sellerAnalytics.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }
}

