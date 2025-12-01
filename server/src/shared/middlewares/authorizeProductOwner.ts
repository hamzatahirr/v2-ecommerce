import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import prisma from "@/infra/database/database.config";

/**
 * Middleware to check if seller owns the product
 * Should be used after protect and authorizeSeller middleware
 * Expects productId in req.params
 */
const authorizeProductOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      return next(new AppError(401, "Unauthorized: No user found"));
    }

    const { id: productId } = req.params;

    if (!productId) {
      return next(new AppError(400, "Product ID is required"));
    }

    // ADMIN can access any product
    if (req.user.role === "ADMIN") {
      return next();
    }

    // For sellers, check product ownership
    if (req.user.isSeller === true) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { 
          id: true, 
          sellerId: true 
        },
      });

      if (!product) {
        return next(new AppError(404, "Product not found"));
      }

      // Check if seller owns this product
      if (product.sellerId !== req.user.id) {
        return next(
          new AppError(403, "You are not authorized to perform this action on this product")
        );
      }
    }

    next();
  } catch (error) {
    return next(new AppError(500, "Internal server error"));
  }
};

export default authorizeProductOwner;

