import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { CheckoutService } from "./checkout.service";
import AppError from "@/shared/errors/AppError";
import { CartService } from "../cart/cart.service";
import { makeLogsService } from "../logs/logs.factory";

export class CheckoutController {
  private logsService = makeLogsService();

  constructor(
    private checkoutService: CheckoutService,
    private cartService: CartService
  ) {}

  initiateCheckout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(400, "User not found");
    }

    const cart = await this.cartService.getOrCreateCart(userId);
    if (!cart.cartItems || cart.cartItems.length === 0) {
      throw new AppError(400, "Cart is empty");
    }

    const { paymentMethod = "STRIPE" } = req.body;

    let result;
    if (paymentMethod === "CASH_ON_DELIVERY") {
      result = await this.checkoutService.createCashOnDeliveryOrder(cart, userId);
    } else {
      const session = await this.checkoutService.createStripeSession(cart, userId);
      result = { sessionId: session.id };
    }

    sendResponse(res, 200, {
      data: result,
      message: `${paymentMethod === "CASH_ON_DELIVERY" ? "COD order" : "Checkout"} initiated successfully`,
    });

    this.cartService.logCartEvent(cart.id, "CHECKOUT_STARTED", userId);

    this.logsService.info(`${paymentMethod === "CASH_ON_DELIVERY" ? "COD order" : "Checkout"} initiated`, {
      userId,
      paymentMethod,
      timePeriod: 0,
    });
  });
}