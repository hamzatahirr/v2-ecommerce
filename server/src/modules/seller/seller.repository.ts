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
          sellerStatus: SELLER_STATUS.APPROVED,
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
      payoutMethod?: string;
      payoutAccountTitle?: string;
      payoutAccountNumber?: string;
      payoutBankName?: string;
      payoutBankBranch?: string;
      payoutVerified?: boolean;
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

  async countOrdersBySellerId(sellerId: string) {
    return prisma.order.count({
      where: { sellerId },
    });
  }

  async countOrdersBySellerIdAndStatus(sellerId: string, status: string) {
    return prisma.order.count({
      where: { sellerId, status },
    });
  }

  async findOrdersBySellerId(
    sellerId: string,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ) {
    const where: any = { sellerId };

    // Add status filter if provided
    if (options?.status) {
      where.status = options.status;
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalResults = await prisma.order.count({ where });

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where,
      orderBy: { orderDate: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            sellerProfile: {
              select: {
                storeName: true,
                storeLogo: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
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
                },
              },
            },
          },
        },
      },
    });

    const totalPages = Math.ceil(totalResults / limit);

    return {
      orders,
      totalPages,
      totalResults,
      currentPage: page,
      resultsPerPage: limit,
    };
  }

  async getTotalRevenueBySellerId(sellerId: string) {
    const result = await prisma.order.aggregate({
      where: { sellerId },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }

  async getRevenueBySellerIdAndMonths(
    sellerId: string,
    months: number
  ) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (months - 1));
    startDate.setDate(1);

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth());

    const result = await prisma.order.aggregate({
      where: {
        sellerId,
        orderDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }

  async findSellerByUserId(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        sellerProfile: true,
      },
    });
  }

  async getSellerStats(userId: string) {
    // First get seller profile to ensure it exists
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

  async getSellerPayouts(userId: string) {
    return prisma.sellerPayout.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findSellerOrderById(userId: string, orderId: string) {
    // First verify user is a seller
    const sellerProfile = await this.findSellerProfileByUserId(userId);
    if (!sellerProfile) {
      throw new Error("Seller profile not found");
    }

    // Find the order through orderItems since orders might not have direct sellerId
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        orderItems: {
          some: {
            sellerId: userId
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
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
                },
              },
            },
          },
        },
        shipment: true,
        transaction: true,
        payment: true,
      },
    });

    if (!order) {
      throw new Error("Order not found or does not belong to this seller");
    }

    return order;
  }

  async updateSellerOrderStatus(userId: string, orderId: string, status: string) {
    // First verify the order belongs to this seller
    const order = await this.findSellerOrderById(userId, orderId);
    
    // Update order status
    return await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        shipment: true,
        transaction: true,
        payment: true,
      },
    });
  }

  async updateSellerOrderShipping(userId: string, orderId: string, shippingInfo: { trackingNumber?: string; shippingNotes?: string }) {
    // First verify the order belongs to this seller
    const order = await this.findSellerOrderById(userId, orderId);
    
    // Update or create shipment record
    const shipmentData: any = {
      trackingNumber: shippingInfo.trackingNumber,
      shippingNotes: shippingInfo.shippingNotes,
    };

    let updatedShipment;
    if (order.shipment) {
      // Update existing shipment
      updatedShipment = await prisma.shipment.update({
        where: { orderId },
        data: shipmentData,
      });
    } else {
      // Create new shipment
      updatedShipment = await prisma.shipment.create({
        data: {
          orderId,
          ...shipmentData,
        },
      });
    }

    // Return updated order with shipment info
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        shipment: true,
        transaction: true,
        payment: true,
      },
    });
  }
}