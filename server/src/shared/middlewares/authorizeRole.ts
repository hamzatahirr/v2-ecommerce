import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../errors";

export const authorizeRole = (...allowedRoles: ('USER' | 'ADMIN')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      throw new UnauthorizedError('Not authenticated');
    }
    
    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(user.role as 'USER' | 'ADMIN')) {
      throw new ForbiddenError('Access denied: insufficient permissions');
    }
    
    next();
  };
};

export default authorizeRole;
