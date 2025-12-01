export type UserRole = 'USER' | 'ADMIN';

export type SellerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  role: UserRole; // USER or ADMIN only
  isSeller: boolean;
  sellerStatus?: SellerStatus;
  avatar: string | null;
  email: string;
  sellerProfile?: {
    id: string;
    storeName: string;
    // Add other seller profile fields as needed
  };
}
