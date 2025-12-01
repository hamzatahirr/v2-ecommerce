import { useAppSelector } from "./state/useRedux";
import { ActiveRole } from "@/app/store/slices/AuthSlice";

export function useAuth() {
  const user = useAppSelector((state) => state.auth.user);
  const activeRole = useAppSelector((state) => state.auth.activeRole);

  // Compute available roles
  const availableRoles: ActiveRole[] = ["USER"]; // Everyone is a user
  if (user?.role === "ADMIN") {
    availableRoles.push("ADMIN");
  }

  // Role checks
  const isBuyer = activeRole === "USER";
  const isSeller = user?.isSeller === true && user?.sellerStatus === "APPROVED";
  const isAdmin = user?.role === "ADMIN";
  const hasMultipleRoles = availableRoles.length > 1;

  return {
    user,
    isAuthenticated: !!user,
    isLoading: user === undefined, 
    activeRole,
    availableRoles,
    isBuyer,
    isSeller,
    isAdmin,
    hasMultipleRoles,
  };
}
