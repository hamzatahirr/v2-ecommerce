import AppError from "@/shared/errors/AppError";
import { OrderRepository } from "./order.repository";
import prisma from "@/infra/database/database.config";
import { generateOrderNumber } from "@/shared/utils/generateOrderNumber";
import { makeWalletService } from "../wallet/wallet.factory";

export class OrderService {
  constructor(private orderRepository: OrderRepository) {
    this.walletService = makeWalletService();
  }
  
  private walletService = makeWalletService();

  async getAllOrders(sellerId?: string, userRole?: string) {
    // Sellers can only see their own orders, ADMIN can see all
    const filterSellerId = userRole === "ADMIN" ? undefined : sellerId;
    
    const orders = await this.orderRepository.findAllOrders(filterSellerId);
    return orders || [];
  }

  async getUserOrders(userId: string, sellerId?: string, userRole?: string) {
    // If user is a seller, they can see orders where they are the buyer OR the seller
    // If user is not a seller, they only see orders where they are the buyer
    const filterSellerId = userRole === "ADMIN" ? undefined : sellerId;
    
    const orders = await this.orderRepository.findOrdersByUserId(userId, filterSellerId);
    return orders || [];
  }

  async getOrderDetails(orderId: string, userId: string, sellerId?: string, userRole?: string) {
    const order = await this.orderRepository.findOrderById(orderId);
    if (!order) {
      throw new AppError(404, "Order not found");
    }
    
    // Authorization: 
    // - Buyers can see orders where they are the buyer
    // - Sellers can see orders where they are the seller
    // - ADMIN can see any order
    if (userRole !== "ADMIN") {
      const isBuyer = order.userId === userId;
      const isSeller = order.sellerId === sellerId;
      
      if (!isBuyer && !isSeller) {
        throw new AppError(403, "You are not authorized to view this order");
      }
    }
    
    return order;
  }

  async createOrderFromCart(userId: string, cartId: string) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { 
        cartItems: { 
          include: { 
            variant: { 
              include: { 
                product: { 
                  include: { seller: true }
                } 
              } 
            } 
          } 
        } 
      },
    });
    if (!cart || cart.cartItems.length === 0) {
      throw new AppError(400, "Cart is empty or not found");
    }
    if (cart.userId !== userId) {
      throw new AppError(403, "You are not authorized to access this cart");
    }

    // Group cart items by seller
    const itemsBySeller = cart.cartItems.reduce((acc, item) => {
      const sellerId = item.variant.product.sellerId;
      if (!sellerId) {
        throw new AppError(400, `Product ${item.variant.product.name} has no seller`);
      }
      
      if (!acc[sellerId]) {
        acc[sellerId] = {
          sellerId,
          seller: item.variant.product.seller,
          items: [],
          totalAmount: 0
        };
      }
      
      acc[sellerId].items.push({
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.variant.price,
        sellerId: sellerId
      });
      
      acc[sellerId].totalAmount += item.quantity * item.variant.price;
      
      return acc;
    }, {} as Record<string, {
      sellerId: string;
      seller: any;
      items: { variantId: string; quantity: number; price: number; sellerId: string }[];
      totalAmount: number;
    }>);

    // Create separate orders for each seller
    const orders = [];
    for (const [sellerId, sellerData] of Object.entries(itemsBySeller)) {
      const order = await this.orderRepository.createOrder({
        userId,
        sellerId,
        amount: sellerData.totalAmount,
        orderNumber: generateOrderNumber(),
        orderItems: sellerData.items,
      });
      orders.push(order);
    }

    return orders;
  }

  async updateOrderStatus(orderId: string, status: string, sellerId: string, userRole?: string) {
    const order = await this.orderRepository.findOrderById(orderId);
    if (!order) {
      throw new AppError(404, "Order not found");
    }

    // Authorization: Only the seller of the order or ADMIN can update status
    if (userRole !== "ADMIN" && order.sellerId !== sellerId) {
      throw new AppError(403, "You are not authorized to update this order status");
    }

    const validStatuses = ["PENDING", "ACCEPTED", "REJECTED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      throw new AppError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    return this.orderRepository.updateOrderStatus(orderId, status);
  }

  async acceptOrder(orderId: string, sellerId: string, userRole?: string) {
    const order = await this.updateOrderStatus(orderId, "ACCEPTED", sellerId, userRole);
    
    // Credit seller wallet when order is accepted (only for non-COD orders)
    try {
      // Check if this is a COD order by looking at the payment method
      const payment = await prisma.payment.findUnique({
        where: { orderId }
      });
      
      if (payment && payment.method !== "CASH_ON_DELIVERY") {
        await this.walletService.creditWalletAfterOrderConfirmation(
          orderId,
          sellerId,
          order.amount
        );
      }
    } catch (error) {
      console.error("Failed to credit wallet:", error);
      // Don't fail the order acceptance if wallet credit fails
    }
    
    return order;
  }

  async rejectOrder(orderId: string, sellerId: string, userRole?: string) {
    return this.updateOrderStatus(orderId, "REJECTED", sellerId, userRole);
  }

  async shipOrder(orderId: string, sellerId: string, userRole?: string) {
    return this.updateOrderStatus(orderId, "SHIPPED", sellerId, userRole);
  }

  async completeOrder(orderId: string, sellerId: string, userRole?: string) {
    return this.updateOrderStatus(orderId, "DELIVERED", sellerId, userRole);
  }
}