import { useRouter, usePathname } from "next/navigation";
import CustomLoader from "../feedback/CustomLoader";
import { useAuth } from "@/app/hooks/useAuth";
import { useEffect } from "react";

interface WithAuthOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireSeller?: boolean;
  requireApprovedSeller?: boolean;
  redirectTo?: string;
}

export function withAuth<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  options?: WithAuthOptions
) {
  return function AuthWrapper(props: P) {
    const { isAuthenticated, isLoading, isSeller, isAdmin, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(options?.redirectTo || "/sign-in");
        return;
      }
      
      if (!isLoading && isAuthenticated) {
        // Check authentication requirement
        if (options?.requireAuth && !isAuthenticated) {
          router.push(options?.redirectTo || "/sign-in");
          return;
        }
        
        // Check admin route protection
        if (options?.requireAdmin && !isAdmin) {
          router.push(options?.redirectTo || "/unauthorized");
          return;
        }
        
        // Check seller access
        if (options?.requireSeller && !isSeller) {
          router.push(options?.redirectTo || "/unauthorized");
          return;
        }
        
        // Check approved seller access
        if (options?.requireApprovedSeller) {
          if (!user?.isSeller || user.sellerStatus !== 'APPROVED') {
            router.push('/seller/pending-approval');
            return;
          }
        }
        
        // Auto-redirect based on route patterns
        if (pathname?.startsWith("/seller") && !isSeller) {
          router.push("/shop");
          return;
        }
        
        if (pathname?.startsWith("/dashboard") && !isAdmin) {
          router.push("/shop");
          return;
        }
      }
    }, [isLoading, isAuthenticated, isSeller, isAdmin, pathname, router, user]);
    
    if (isLoading) return <CustomLoader />;
    
    if (!isAuthenticated) return null;
    
    return <Component {...props} />;
  };
}

// Specialized auth wrappers
export const withSellerAuth = <P extends Record<string, unknown>>(
  Component: React.ComponentType<P>
) => withAuth(Component, { requireSeller: true, requireApprovedSeller: true });

export const withAdminAuth = <P extends Record<string, unknown>>(
  Component: React.ComponentType<P>
) => withAuth(Component, { requireAdmin: true });
