import { SELLER_STATUS } from "@prisma/client";

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  storeDescription?: string | null;
  storeLogo?: string | null;
  storeBanner?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
  stripeAccountId?: string | null;
  stripeOnboardingComplete: boolean;
  totalSales: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerApplicationData {
  storeName: string;
  storeDescription?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface SellerUpdateData {
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  storeBanner?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
}

