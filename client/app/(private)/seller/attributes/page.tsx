"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import ProductAttributeAssignment from "./ProductAttributeAssignment";
import DashboardHeader from "@/app/(private)/dashboard/attributes/DashboardHeader";
import { useGetAllAttributesQuery } from "@/app/store/apis/AttributeApi";

const SellerAttributesPage: React.FC = () => {
  const { data, isLoading, error } = useGetAllAttributesQuery(undefined);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 bg-red-50 rounded-lg">
        Error loading attributes: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  return (
    <div className="p-6 min-w-full bg-gray-50 min-h-screen">
      <DashboardHeader />

      {/* Main Content */}
      <div className="mt-6">
        <ProductAttributeAssignment attributes={data?.attributes?.filter((attr, index, self) =>
          index === self.findIndex((a) => a.id === attr.id)
        ) || []} />
      </div>
    </div>
  );
};

export default SellerAttributesPage;