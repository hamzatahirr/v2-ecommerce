"use client";
import { Store, AlertTriangle } from "lucide-react";
import BreadCrumb from "@/app/components/feedback/BreadCrumb";
import Sidebar from "../../components/layout/Sidebar";
import HamburgerMenu from "../../components/layout/HamburgerMenu";
import DashboardSearchBar from "@/app/components/molecules/DashboardSearchbar";
import { useAuth } from "@/app/hooks/useAuth";
import Image from "next/image";
import { SidebarProvider } from "@/app/contexts/SidebarContext";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  
  // Check if user is a seller
  if (!user?.isSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Store className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Seller access required</p>
        </div>
      </div>
    );
  }
  
  // Check if seller is approved
  if (user.sellerStatus !== 'APPROVED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Seller Application Pending</h1>
          <p className="text-gray-600">Your seller application is under review</p>
        </div>
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4">
              <HamburgerMenu />
              <BreadCrumb />
            </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <DashboardSearchBar />
            <div className="relative w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name || "Seller"}
                  fill
                  sizes="36px"
                  className="rounded-full object-cover"
                />
              ) : (
                <Store className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">
                {user?.name} (Seller)
              </span>
            </div>
          </div>
        </header>
        
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}