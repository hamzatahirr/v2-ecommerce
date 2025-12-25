export type UserRole = 'USER' | 'ADMIN';

export type SellerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  role: UserRole; // USER or ADMIN only
  isSeller: boolean;
  sellerStatus?: SellerStatus;
  verificationStatus?: VerificationStatus;
  avatar: string | null;
  email: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  sellerProfile?: {
    id: string;
    storeName: string;
    // Add other seller profile fields as needed
  };
}
