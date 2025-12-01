import { User } from "@/app/types/authTypes";

/**
 * Check if user is a seller
 */
export const isSeller = (user: User | null): boolean => {
  return user?.isSeller === true;
};

/**
 * Check if user is an admin
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'ADMIN';
};

/**
 * Check if user can access seller dashboard
 * Must be a seller with APPROVED status
 */
export const canAccessSellerDashboard = (user: User | null): boolean => {
  return isSeller(user) && user?.sellerStatus === 'APPROVED';
};

/**
 * Check if user can access admin dashboard
 */
export const canAccessAdminDashboard = (user: User | null): boolean => {
  return isAdmin(user);
};

/**
 * Get user's display role for UI purposes
 */
export const getUserDisplayRole = (user: User | null): string => {
  if (isAdmin(user)) return 'Admin';
  if (isSeller(user)) return 'Seller';
  return 'Buyer';
};

/**
 * Get user's capabilities
 */
export const getUserCapabilities = (user: User | null) => {
  return {
    canBuy: true, // Everyone can buy
    canSell: canAccessSellerDashboard(user),
    canManageUsers: isAdmin(user),
    canManageSystem: isAdmin(user),
    canViewAnalytics: canAccessSellerDashboard(user) || isAdmin(user),
  };
};

/**
 * Check if user can perform admin action
 */
export const canPerformAdminAction = (user: User | null, action: string): boolean => {
  if (!isAdmin(user)) return false;
  
  // Add specific action checks if needed
  switch (action) {
    case 'create_admin':
      // Only admins can create other admins
      return true;
    case 'delete_user':
      // Admins can delete users (with hierarchy checks)
      return true;
    case 'update_user':
      // Admins can update users (with hierarchy checks)
      return true;
    default:
      return false;
  }
};