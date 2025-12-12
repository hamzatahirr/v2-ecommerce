export enum Role {
  USER = "USER",
  ADMIN = "ADMIN"
}

export type SellerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface JwtUser {
  id: string;
  role: Role;
  name?: string;
  email?: string;
  emailVerified?: boolean;
  avatar?: string | null;
  isSeller: boolean;
  sellerStatus?: SellerStatus;
  sellerProfile?: {
    id: string;
    // Add other seller profile fields as needed
  };
}
