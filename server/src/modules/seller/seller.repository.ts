import prisma from "@/infra/database/database.config";
import { SELLER_STATUS } from "@prisma/client";

export class SellerRepository {
  async findSellerProfileByUserId(userId: string) {
    return prisma.sellerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            isSeller: true,
            sellerStatus: true,
          },
        },
      },
    });
  }

  async findSellerProfileById(id: string) {
    return prisma.sellerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            isSeller: true,
            sellerStatus: true,
          },
        },
      },
    });
  }

  async createSellerProfile(
    userId: string,
    data: {
      storeName: string;
      storeDescription?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      // Update user to be a seller
      await tx.user.update({
        where: { id: userId },
        data: {
          isSeller: true,
          sellerStatus: SELLER_STATUS.PENDING_APPROVAL,
        },
      });

      // Create seller profile
      return tx.sellerProfile.create({
        data: {
          userId,
          storeName: data.storeName,
          storeDescription: data.storeDescription,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          zipCode: data.zipCode,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
              isSeller: true,
              sellerStatus: true,
            },
          },
        },
      });
    });
  }

  async updateSellerProfile(
    userId: string,
    data: {
      storeName?: string;
      storeDescription?: string;
      storeLogo?: string;
      storeBanner?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    }
  ) {
    return prisma.sellerProfile.update({
      where: { userId },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            isSeller: true,
            sellerStatus: true,
          },
        },
      },
    });
  }

  async getSellerStats(userId: string) {
    // First get the seller profile to ensure it exists
    const profile = await this.findSellerProfileByUserId(userId);
    if (!profile) {
      throw new Error("Seller profile not found");
    }

    const [products, orderItemsData, payments, reviews] = await Promise.all([
      // Total products
      prisma.product.count({
        where: { sellerId: userId },
      }),

      // Get all order items for this seller
      prisma.orderItem.findMany({
        where: { sellerId: userId },
        include: {
          order: {
            select: { 
              id: true,
              status: true,
              userId: true,
            },
          },
        },
      }),

      // Total revenue and earnings from payments
      prisma.payment.aggregate({
        where: { sellerId: userId, status: "PAID" },
        _sum: { amount: true },
      }),

      // Reviews
      prisma.sellerReview.aggregate({
        where: { sellerId: userId },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    // Count unique orders
    const uniqueOrderIds = new Set(orderItemsData.map((item) => item.orderId));
    const totalOrders = uniqueOrderIds.size;

    // Count orders by status
    const pendingOrders = orderItemsData.filter(
      (item) => item.order.status === "PENDING"
    ).length;
    const completedOrders = orderItemsData.filter(
      (item) => item.order.status === "DELIVERED"
    ).length;

    // Get unique customers
    const uniqueCustomers = new Set(
      orderItemsData.map((item) => item.order.userId)
    ).size;

    return {
      totalProducts: products,
      totalOrders,
      totalRevenue: payments._sum.amount || 0,
      totalEarnings: payments._sum.amount || 0, // Can be adjusted for platform fees
      averageRating: reviews._avg.rating || 0,
      reviewCount: reviews._count,
      pendingOrders,
      completedOrders,
      totalCustomers: uniqueCustomers,
    };
  }

  async findSellerByUserId(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        sellerProfile: true,
      },
    });
  }

  async getSellerPayouts(userId: string) {
    return prisma.sellerPayout.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
    });
  }
}

