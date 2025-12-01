"use client";
import { useAuth } from "@/app/hooks/useAuth";
import PrivateLayout from "../layout";
import SellerLayout from "../seller/layout";

export default function ChatLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PrivateLayout>{children}</PrivateLayout>;
  }

  // If user is a seller and approved, use seller layout
  if (user?.isSeller && user.sellerStatus === 'APPROVED') {
    return <SellerLayout>{children}</SellerLayout>;
  }

  // Otherwise, use regular private layout
  return <PrivateLayout>{children}</PrivateLayout>;
}