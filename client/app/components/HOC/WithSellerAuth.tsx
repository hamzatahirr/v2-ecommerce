import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomLoader from "../feedback/CustomLoader";
import { useAuth } from "@/app/hooks/useAuth";

export function withSellerAuth<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>
) {
  return function SellerAuthWrapper(props: P) {
    const { user, isAuthenticated, isLoading, isSeller } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push("/sign-in");
        } else if (!isSeller) {
          // Redirect non-sellers to shop
          router.push("/shop");
        }
      }
    }, [isLoading, isAuthenticated, isSeller, router]);

    if (isLoading) return <CustomLoader />;

    if (!isAuthenticated || !isSeller) {
      return null;
    }

    return <Component {...props} />;
  };
}

