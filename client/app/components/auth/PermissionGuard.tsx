"use client";
import React, { ReactNode } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { Shield, AlertTriangle } from "lucide-react";

interface PermissionGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireSeller?: boolean;
  requireApprovedSeller?: boolean;
  fallback?: ReactNode;
  showFallback?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requireAdmin,
  requireSeller,
  requireApprovedSeller,
  fallback,
  showFallback = true,
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return showFallback ? (
      <div className="flex items-center justify-center p-6 bg-red-50 rounded-lg border border-red-200">
        <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
        <span className="text-red-700 text-sm">Authentication required</span>
      </div>
    ) : null;
  }
  
  // Check admin access
  if (requireAdmin && user.role !== 'ADMIN') {
    return showFallback
      ? fallback || (
        <div className="flex items-center justify-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <Shield className="w-5 h-5 text-yellow-500 mr-2" />
          <span className="text-yellow-700 text-sm">Admin access required</span>
        </div>
      )
      : null;
  }
  
  // Check seller access
  if (requireSeller && !user.isSeller) {
    return showFallback
      ? fallback || (
        <div className="flex items-center justify-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
          <span className="text-yellow-700 text-sm">Seller access required</span>
        </div>
        )
      : null;
  }
  
  // Check approved seller access
  if (requireApprovedSeller) {
    if (!user.isSeller || user.sellerStatus !== 'APPROVED') {
      return showFallback
        ? fallback || (
          <div className="flex items-center justify-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-yellow-700 text-sm">Approved seller access required</span>
          </div>
          )
        : null;
    }
  }
  
  return <>{children}</>;
}

export { PermissionGuard };
export default PermissionGuard;