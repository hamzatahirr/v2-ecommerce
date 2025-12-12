import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import AppError from "@/shared/errors/AppError";
import { OrderService } from "./order.service";

export class OrderController {
  constructor(private orderService: OrderService) {}

  getAllOrders = asyncHandler(async (req: Request, res: Response) => {
    const sellerId = req.user?.isSeller ? req.user.id : undefined;
    const userRole = req.user?.role;
    const { page = 1, limit = 10, status } = req.query;

    const orders = await this.orderService.getAllOrders(
      sellerId, 
      userRole,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string
      }
    );
    sendResponse(res, 200, {
      data: orders,
      message: "Orders retrieved successfully",
    });
  });

  getUserOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(400, "User not found");
    }
    const sellerId = req.user?.isSeller ? userId : undefined;
    const userRole = req.user?.role;

    const orders = await this.orderService.getUserOrders(userId, sellerId, userRole);
    sendResponse(res, 200, {
      data: { orders },
      message: "Orders retrieved successfully",
    });
  });

  getOrderDetails = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(400, "User not found");
    }
    const sellerId = req.user?.isSeller ? userId : undefined;
    const userRole = req.user?.role;

    const order = await this.orderService.getOrderDetails(orderId, userId, sellerId, userRole);
    sendResponse(res, 200, {
      data: { order },
      message: "Order details retrieved successfully",
    });
  });

  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { cartId } = req.body;
    if (!userId) {
      throw new AppError(400, "User not found");
    }
    if (!cartId) {
      throw new AppError(400, "Cart ID is required");
    }
    const orders = await this.orderService.createOrderFromCart(userId, cartId);
    sendResponse(res, 201, {
      data: { orders },
      message: "Orders created successfully",
    });
  });

  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const sellerId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!sellerId) {
      throw new AppError(400, "User not found");
    }
    if (!status) {
      throw new AppError(400, "Status is required");
    }

    const order = await this.orderService.updateOrderStatus(orderId, status, sellerId, userRole);
    sendResponse(res, 200, {
      data: { order },
      message: "Order status updated successfully",
    });
  });

  acceptOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const sellerId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!sellerId) {
      throw new AppError(400, "User not found");
    }

    const order = await this.orderService.acceptOrder(orderId, sellerId, userRole);
    sendResponse(res, 200, {
      data: { order },
      message: "Order accepted successfully",
    });
  });

  rejectOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const sellerId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!sellerId) {
      throw new AppError(400, "User not found");
    }

    const order = await this.orderService.rejectOrder(orderId, sellerId, userRole);
    sendResponse(res, 200, {
      data: { order },
      message: "Order rejected successfully",
    });
  });

  shipOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const sellerId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!sellerId) {
      throw new AppError(400, "User not found");
    }

    const order = await this.orderService.shipOrder(orderId, sellerId, userRole);
    sendResponse(res, 200, {
      data: { order },
      message: "Order shipped successfully",
    });
  });

  completeOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const sellerId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!sellerId) {
      throw new AppError(400, "User not found");
    }

    const order = await this.orderService.completeOrder(orderId, sellerId, userRole);
    sendResponse(res, 200, {
      data: { order },
      message: "Order completed successfully",
    });
  });
}