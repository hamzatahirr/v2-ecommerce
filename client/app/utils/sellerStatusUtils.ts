import { User } from "@/app/types/authTypes";

/**
 * Save seller status to localStorage for persistence
 */
export const saveSellerStatus = (user: User | null): void => {
  if (typeof window !== "undefined" && user) {
    localStorage.setItem("isSeller", user.isSeller.toString());
    localStorage.setItem("sellerStatus", user.sellerStatus || "");
  }
};

/**
 * Load seller status from localStorage
 */
export const loadSellerStatus = (): { isSeller: boolean; sellerStatus: string | null } => {
  if (typeof window !== "undefined") {
    const isSeller = localStorage.getItem("isSeller") === "true";
    const sellerStatus = localStorage.getItem("sellerStatus");
    return { isSeller, sellerStatus };
  }
  return { isSeller: false, sellerStatus: null };
};

/**
 * Clear seller status from localStorage
 */
export const clearSellerStatus = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("isSeller");
    localStorage.removeItem("sellerStatus");
  }
};

/**
 * Enhance user data with persisted seller status if missing
 */
export const enhanceUserWithSellerStatus = (user: User | null): User | null => {
  if (!user) return null;
  
  // If user already has seller info, just save it
  if (typeof user.isSeller === "boolean") {
    saveSellerStatus(user);
    return user;
  }
  
  // If user is missing seller info, try to restore from localStorage
  const persisted = loadSellerStatus();
  return {
    ...user,
    isSeller: persisted.isSeller,
    sellerStatus: persisted.sellerStatus as any,
  };
};