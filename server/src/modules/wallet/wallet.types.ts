export interface WalletBalance {
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  orderId?: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description?: string;
  metadata?: any;
  holdUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletWithDetails {
  id: string;
  sellerId: string;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  seller: {
    id: string;
    name: string;
    email: string;
  };
  walletTransactions: WalletTransaction[];
  withdrawals: any[];
}

export interface CreditWalletParams {
  orderId: string;
  sellerId: string;
  orderAmount: number;
}

export interface WalletTransactionResult {
  wallet: WalletWithDetails;
  transaction: WalletTransaction;
  commissionAmount: number;
  netAmount: number;
  holdUntil: Date;
}