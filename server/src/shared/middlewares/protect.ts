import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../errors/AppError";
import prisma from "@/infra/database/database.config";
import { JwtUser } from "../types/userTypes";
import { SELLER_STATUS } from "@prisma/client";

const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req?.cookies?.accessToken;
    console.log("accessToken: ", accessToken);
    if (!accessToken) {
      return next(new AppError(401, "Unauthorized, please log in"));
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtUser;

    console.log("Decoded: ", decoded);

    const user = await prisma.user.findUnique({
      where: { id: String(decoded.id) },
      select: {
        id: true,
        role: true,
        isSeller: true,
        sellerStatus: true,
        verificationStatus: true
      },
    });

    if (!user) {
      return next(new AppError(401, "User no longer exists."));
    }

    // Check for profile switching in headers or query (optional, for frontend convenience)
    const profileType = req.headers["x-profile-type"] as "buyer" | "seller" | undefined;
    
    // If switching to seller profile, validate seller status
    if (profileType === "seller") {
      if (!user.isSeller) {
        return next(new AppError(400, "You are not a seller. Please apply to become a seller first."));
      }
      if (user.sellerStatus !== SELLER_STATUS.APPROVED) {
        return next(new AppError(400, `Your seller account is ${user.sellerStatus}. You cannot switch to seller profile.`));
      }
    }

    req.user = {
      id: decoded.id,
      role: user.role,
      isSeller: user.isSeller || false,
      sellerStatus: user.sellerStatus,
      verificationStatus: user.verificationStatus,
      currentProfile: profileType || (user.isSeller && user.sellerStatus === SELLER_STATUS.APPROVED ? "seller" : "buyer"),
    };
    next();
  } catch (error) {
    console.log(error);
    return next(new AppError(409, "Invalid access token, please log in"));
  }
};

export default protect;
