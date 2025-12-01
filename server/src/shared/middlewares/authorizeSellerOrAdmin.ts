import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../errors";

export const authorizeSellerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    throw new UnauthorizedError('Not authenticated');
  }
  
  const isAdmin = user.role === 'ADMIN';
  const isApprovedSeller = user.isSeller && user.sellerStatus === 'APPROVED';
  
  if (!isAdmin && !isApprovedSeller) {
    throw new ForbiddenError('Admin or approved seller access required');
  }
  
  next();
};

export default authorizeSellerOrAdmin;
