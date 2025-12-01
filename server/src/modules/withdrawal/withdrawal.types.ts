export interface WithdrawalRequest {
  amount: number;
  method?: string;
  details?: {
    accountHolder?: string;
    accountNumber?: string;
    bankName?: string;
    routingNumber?: string;
    swiftCode?: string;
    [key: string]: any;
  };
}

export interface Withdrawal {
  id: string;
  walletId: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  method: string;
  details?: any;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  wallet: {
    id: string;
    sellerId: string;
    seller: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface WithdrawalStats {
  totalWithdrawn: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  pendingAmount: number;
  completedAmount: number;
}

export interface WithdrawalListResponse {
  withdrawals: Withdrawal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}