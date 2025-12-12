import { useGetUserVerificationDetailsQuery } from "../store/apis/UserApi";
import { useAppSelector } from "./state/useRedux";
import { ActiveRole } from "@/app/store/slices/AuthSlice";

export function useAuth() {
    

  const user = useAppSelector((state) => state.auth.user);
  const { data: data } = useGetUserVerificationDetailsQuery(user?.id || '', {
    skip: !user?.id,
  } );
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

  // Verification status checks
  const verificationStatus = data?.user?.verificationStatus;
  const isVerified = verificationStatus === "APPROVED";
  const isPendingVerification = verificationStatus === "PENDING";
  const isRejectedVerification = verificationStatus === "REJECTED";

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
    // Verification properties
    verificationStatus,
    isVerified,
    isPendingVerification,
    isRejectedVerification,
  };
}
