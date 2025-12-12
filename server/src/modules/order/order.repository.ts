import prisma from "@/infra/database/database.config";

export class OrderRepository {
  async findAllOrders(
    sellerId?: string,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ) {
    const where: any = {};
    if (sellerId) {
      where.sellerId = sellerId;
    }
    
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
        payment: true,
        shipment: true,
        transaction: true,
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

  async findOrdersByUserId(userId: string, sellerId?: string) {
    // If sellerId is provided, user can see orders where they are buyer OR seller
    // If user is not a seller, they only see orders where they are buyer
    const where: any = sellerId
      ? {
          OR: [
            { userId },
            { sellerId },
          ],
        }
      : { userId };

    return prisma.order.findMany({
      where,
      orderBy: { orderDate: "desc" },
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
        payment: true,
        address: true,
        shipment: true,
        transaction: true,
      },
    });
  }

  async findOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
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
        payment: true,
        address: true,
        shipment: true,
        transaction: true,
      },
    });
  }

  async createOrder(data: {
    userId: string;
    sellerId: string;
    amount: number;
    orderNumber: string;
    orderItems: { variantId: string; quantity: number; price: number; sellerId: string }[];
  }) {
    return prisma.order.create({
      data: {
        userId: data.userId,
        sellerId: data.sellerId,
        amount: data.amount,
        orderNumber: data.orderNumber,
        orderDate: new Date(),
        status: "PENDING",
        orderItems: {
          create: data.orderItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            sellerId: item.sellerId,
          })),
        },
      },
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
        payment: true,
        address: true,
        shipment: true,
        transaction: true,
      },
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return prisma.order.update({
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
        payment: true,
        shipment: true,
        transaction: true,
      },
    });
  }
}