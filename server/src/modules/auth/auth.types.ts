import { SELLER_STATUS } from "@prisma/client";
import { Role } from "@/shared/types/userTypes";

export interface RegisterUserParams {
  name: string;
  email: string;
  password: string;
  role?: Role;
  isSeller?: boolean;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface UserResponseBase {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  isSeller: boolean;
  sellerStatus?: SELLER_STATUS | null;
}

export interface AuthResponse {
  user: UserResponseBase;
  accessToken: string;
  refreshToken: string;
}
