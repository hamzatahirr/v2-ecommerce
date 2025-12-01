import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../errors";

/**
 * Middleware to authorize approved sellers only
 * Checks if user is a seller with APPROVED status
 */
export const authorizeSeller = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    throw new UnauthorizedError('Not authenticated');
  }
  
  // Must be a seller (isSeller=true)
  if (!user.isSeller) {
    throw new ForbiddenError('Seller access required');
  }
  
  // Check if seller is approved
  if (user.sellerStatus !== 'APPROVED') {
    throw new ForbiddenError('Seller account not approved');
  }
  
  next();
};

export default authorizeSeller;

