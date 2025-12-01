import prisma from "@/infra/database/database.config";

export class OrderRepository {
  async findAllOrders(sellerId?: string) {
    const where: any = {};
    if (sellerId) {
      where.sellerId = sellerId;
    }

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
              } 
            } 
          } 
        },
        payment: true,
        address: true,
        shipment: true,
        transaction: true,
      },
    });
  }

  async findOrdersByUserId(userId: string, sellerId?: string) {
    // If sellerId is provided, user can see orders where they are buyer OR seller
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
              } 
            } 
          } 
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
              } 
            } 
          } 
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
    return prisma.$transaction(async (tx) => {
      // Validate stock for all variants
      for (const item of data.orderItems) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, product: { select: { id: true, salesCount: true } } },
        });
        if (!variant) {
          throw new Error(`Variant not found: ${item.variantId}`);
        }
        if (variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for variant ${item.variantId}: only ${variant.stock} available`);
        }
      }

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber: data.orderNumber,
          userId: data.userId,
          sellerId: data.sellerId,
          amount: data.amount,
          orderItems: {
            create: data.orderItems.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              sellerId: item.sellerId,
            })),
          },
        },
      });

      // Update stock and sales count
      for (const item of data.orderItems) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, product: { select: { id: true, salesCount: true } } },
        });
        if (variant) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: variant.stock - item.quantity },
          });
          await tx.product.update({
            where: { id: variant.product.id },
            data: { salesCount: variant.product.salesCount + item.quantity },
          });
        }
      }

      return order;
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
                product: true
              } 
            } 
          } 
        },
        payment: true,
        address: true,
        shipment: true,
        transaction: true,
      },
    });
  }
}