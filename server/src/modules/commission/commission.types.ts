export interface Commission {
  id: string;
  categoryId: string;
  rate: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface CommissionRequest {
  categoryId: string;
  rate: number;
  description?: string;
}

export interface CommissionUpdateRequest {
  rate?: number;
  description?: string;
}

export interface CommissionListResponse {
  commissions: Commission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CommissionStats {
  totalCommissions: number;
  averageRate: number;
  categoriesWithCommission: number;
  categoriesWithoutCommission: number;
  totalCategories: number;
}

export interface CategoryWithoutCommission {
  id: string;
  name: string;
  slug: string;
}

export interface BulkCommissionRequest {
  commissions: CommissionRequest[];
}