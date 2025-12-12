"use client";
import Table from "@/app/components/layout/Table";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";

import {
  useGetAllSellersQuery,
  useGetPendingSellersCountQuery,
  useApproveSellerMutation,
  useRejectSellerMutation,
  useSuspendSellerMutation,
} from "@/app/store/apis/SellerApi";
import CustomLoader from "@/app/components/feedback/CustomLoader";
import { motion } from "framer-motion";

// Seller status color utility
const getSellerStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "SUSPENDED":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const SellersDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch pending count for badge
  const { data: pendingCountData } = useGetPendingSellersCountQuery();

  // Mutations for updating seller status
  const [approveSeller] = useApproveSellerMutation();
  const [rejectSeller] = useRejectSellerMutation();
  const [suspendSeller] = useSuspendSellerMutation();

  // Fetch sellers with filters
  const { data, isLoading, error } = useGetAllSellersQuery({
    status: activeTab === "all" ? undefined : activeTab.toUpperCase(),
    searchQuery: searchQuery || undefined,
  });

  const allSellers = data?.sellers || [];
   const sellers =
    allSellers?.map((seller: any) => ({
      id: seller.id,
      userId: seller.id,
      storeName: seller.sellerProfile?.storeName ?? "-",
      ownerName: seller.name ?? "-",
      email: seller.email ?? "-",
      appliedDate: seller.createdAt ?? null,
      status: seller.sellerStatus ?? "UNKNOWN",
      user: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
      },
    })) || [];

  const pendingCount = pendingCountData?.total || 0;
  // console.log("Sellers Data:", sellers);

  // Handle status update
  const handleStatusUpdate = async (sellerId: string, newStatus: string) => {
    try {
      let result;
      switch (newStatus) {
        case 'APPROVED':
          result = await approveSeller(sellerId).unwrap();
          break;
        case 'REJECTED':
          result = await rejectSeller({ id: sellerId }).unwrap();
          break;
        case 'SUSPENDED':
          result = await suspendSeller({ id: sellerId }).unwrap();
          break;
        default:
          return;
      }
      
      if (result.success) {
        // Show success message or refresh data
        console.log('Status updated successfully');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const tabs = [
    { id: "all", label: "All", count: sellers.length },
    {
      id: "approved",
      label: "Approved",
      count: sellers.filter((s) => s.status === "APPROVED").length,
    },
    {
      id: "rejected",
      label: "Rejected",
      count: sellers.filter((s) => s.status === "REJECTED").length,
    },
    {
      id: "suspended",
      label: "Suspended",
      count: sellers.filter((s) => s.status === "SUSPENDED").length,
    },
  ];

  const columns = [
    {
      key: "storeName",
      label: "Store Name",
      sortable: true,
      render: (row: any) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{row.storeName || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "ownerName",
      label: "Owner Name",
      sortable: true,
      render: (row: any) => (
        <span>{row.user?.name || "N/A"}</span>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (row: any) => (
        <span className="text-gray-600">{row.user?.email || "N/A"}</span>
      ),
    },
    {
      key: "appliedDate",
      label: "Applied Date",
      sortable: true,
      render: (row: any) => (
        <span>
          {row.appliedDate
            ? new Date(row.appliedDate).toLocaleDateString()
            : "N/A"}
        </span>
      ),
    },
    { 
      key: "status",
      label: "Status",
      sortable: true,
      render: (row: any) => (
        <select
          value={row.sellerStatus || row.status}
          onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
          className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-indigo-500 ${getSellerStatusColor(
            row.sellerStatus || row.status
          )}`}
        >
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      ),
    }
  ];

  // Filter sellers based on search query
  const filteredSellers = useMemo(() => {
    if (!searchQuery) return sellers;
    const query = searchQuery.toLowerCase();
    return sellers.filter(
      (seller) =>
        seller.email?.toLowerCase().includes(query) ||
        seller.ownerName?.toLowerCase().includes(query) ||
        seller?.storeName?.toLowerCase().includes(query)

    );
  }, [sellers, searchQuery]);

  if (isLoading) {
    return <CustomLoader />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading sellers. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Seller Applications</h1>
        <p className="text-sm text-gray-500">
          Manage and review seller applications
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by store name, owner name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap relative transition-colors ${
                activeTab === tab.id
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
              
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <p className="text-sm text-gray-500 mb-1">Total Sellers</p>
          <p className="text-2xl font-semibold">{sellers.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-semibold text-yellow-600">
            {pendingCount}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <p className="text-sm text-gray-500 mb-1">Approved</p>
          <p className="text-2xl font-semibold text-green-600">
            {sellers.filter((s) => s.status === "APPROVED").length}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <p className="text-sm text-gray-500 mb-1">Rejected</p>
          <p className="text-2xl font-semibold text-red-600">
            {sellers.filter((s) => s.status === "REJECTED").length}
          </p>
        </motion.div>
      </div>

      {/* Table */}
      <Table
        data={filteredSellers}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No seller applications found"
        onRefresh={() => console.log("refreshed")}
        totalPages={data?.totalPages}
        totalResults={data?.totalResults}
        resultsPerPage={data?.resultsPerPage}
        currentPage={data?.currentPage}
      />
    </div>
  );
};

export default SellersDashboard;

