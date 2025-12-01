declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      role: string;
      isSeller?: boolean;
      sellerStatus?: "PENDING_APPROVAL" | "APPROVED" | "SUSPENDED" | "REJECTED" | null;
      currentProfile?: "buyer" | "seller";
    };
    session: {
      id: string;
    };
  }
  export interface Response {
    user: any;
  }
}
