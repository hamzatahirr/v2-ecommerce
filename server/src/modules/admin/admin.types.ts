import { SELLER_STATUS } from "@prisma/client";

export interface SellerListFilters {
  status?: SELLER_STATUS;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SellerListResponse {
  sellers: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

