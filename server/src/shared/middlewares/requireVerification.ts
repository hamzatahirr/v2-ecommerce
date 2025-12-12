import { Request, Response, NextFunction } from "express";
import { USER_VERIFICATION_STATUS } from "@prisma/client";
import prisma from "@/infra/database/database.config";
import AppError from "@/shared/errors/AppError";

interface RequireVerificationOptions {
  redirectToVerification?: boolean;
  allowPending?: boolean;
  allowRejected?: boolean;
}

/**
 * Middleware to require user verification before accessing certain routes
 * @param options Configuration options for the middleware
 */
const requireVerification = (options: RequireVerificationOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return next(new AppError(401, "Authentication required"));
      }

      // Fetch user verification status
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          verificationStatus: true,
          rejectionReason: true,
        },
      });

      if (!user) {
        return next(new AppError(401, "User not found"));
      }

      const {
        redirectToVerification = true,
        allowPending = false,
        allowRejected = false,
      } = options;

      // Check verification status
      if (user.verificationStatus === USER_VERIFICATION_STATUS.APPROVED) {
        // User is verified, allow access
        return next();
      }

      if (user.verificationStatus === USER_VERIFICATION_STATUS.PENDING) {
        if (allowPending) {
          return next();
        }

        if (redirectToVerification) {
          return next(new AppError(403, "Your account is pending verification. Please complete your verification process.", true, [
            {
              property: "verification",
              constraints: {
                code: "VERIFICATION_PENDING",
                userStatus: user.verificationStatus,
              }
            }
          ]));
        } else {
          return next(new AppError(403, "Account verification is pending"));
        }
      }

      if (user.verificationStatus === USER_VERIFICATION_STATUS.REJECTED) {
        if (allowRejected) {
          return next();
        }

        const errorMessage = user.rejectionReason
          ? `Your verification was rejected: ${user.rejectionReason}`
          : "Your account verification was rejected. Please re-submit your documents.";

        if (redirectToVerification) {
          return next(new AppError(403, errorMessage, true, [
            {
              property: "verification",
              constraints: {
                code: "VERIFICATION_REJECTED",
                userStatus: user.verificationStatus || "UNKNOWN",
                rejectionReason: user.rejectionReason || "No reason provided",
              }
            }
          ]));
        } else {
          return next(new AppError(403, errorMessage));
        }
      }

      // Default case (should not happen with proper enum)
      return next(new AppError(500, "Invalid verification status"));

    } catch (error) {
      return next(new AppError(500, "Error checking verification status"));
    }
  };
};

export default requireVerification;
