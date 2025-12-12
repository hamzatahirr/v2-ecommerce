"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./useAuth";

interface VerificationGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  allowPending?: boolean;
}

export function VerificationGuard({ 
  children, 
  redirectTo = "/verification", 
  allowPending = false 
}: VerificationGuardProps) {
  const { isAuthenticated, isLoading, isVerified, verificationStatus } = useAuth();
  console.log("VerificationGuard - isAuthenticated:", isAuthenticated, "isLoading:", isLoading, "isVerified:", isVerified, "verificationStatus:", verificationStatus);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    if (!isLoading && isAuthenticated && !isVerified) {
      if (!allowPending || verificationStatus !== "PENDING") {
        // Avoid redirect loop if we're already on the verification page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/verification')) {
          router.push(redirectTo);
        }
        return;
      }
    }
  }, [isAuthenticated, isLoading, isVerified, verificationStatus, router, redirectTo, allowPending]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isVerified) {
    if (!allowPending || verificationStatus !== "PENDING") {
      return null;
    }
  }

  return <>{children}</>;
}