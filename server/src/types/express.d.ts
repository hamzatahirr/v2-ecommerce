import { USER_VERIFICATION_STATUS, SELLER_STATUS } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        isSeller?: boolean;
        sellerStatus?: SELLER_STATUS | null;
        currentProfile?: "buyer" | "seller";
        verificationStatus?: USER_VERIFICATION_STATUS | null | undefined; 
      };
      session: {
        id: string;
      };
    }
    interface Response {
      user: any;
    }
  }
}

export {};