"use client";
import { Shield, User } from "lucide-react";
import BreadCrumb from "@/app/components/feedback/BreadCrumb";
import Sidebar from "../../components/layout/Sidebar";
import HamburgerMenu from "../../components/layout/HamburgerMenu";
import DashboardSearchBar from "@/app/components/molecules/DashboardSearchbar";
import { useAuth } from "@/app/hooks/useAuth";
import Image from "next/image";
import { SidebarProvider } from "@/app/contexts/SidebarContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Shield className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Admin access required</p>
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
                  alt={user.name || "User"}
                  fill
                  sizes="36px"
                  className="rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {user?.name && (
                <span className="text-sm font-medium text-gray-800 hidden sm:inline">
                  {user.name}
                </span>
              )}
            </div>
          </div>
        </header>
        
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}