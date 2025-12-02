"use client";
import dynamic from "next/dynamic";
import StatsCard from "@/app/components/organisms/StatsCard";
import Dropdown from "@/app/components/molecules/Dropdown";
import { BarChart2, DollarSign, Package, ShoppingCart, Store } from "lucide-react";
import { motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import React from "react";
import useFormatPrice from "@/app/hooks/ui/useFormatPrice";
import CustomLoader from "@/app/components/feedback/CustomLoader";
import ListCard from "@/app/components/organisms/ListCard";
import { withSellerAuth } from "@/app/components/HOC/WithSellerAuth";
import {
  useGetSellerAnalyticsQuery,
  useGetSellerOrdersQuery,
  useGetSellerProfileQuery,
} from "@/app/store/apis/SellerApi";
import Table from "@/app/components/layout/Table";
import { useRouter } from "next/navigation";

const AreaChart = dynamic(
  () => import("@/app/components/charts/AreaChartComponent"),
  { ssr: false }
);
const BarChart = dynamic(
  () => import("@/app/components/charts/BarChartComponent"),
  { ssr: false }
);

interface FormData {
  timePeriod: string;
}

const SellerDashboard = () => {
  const { control, watch } = useForm<FormData>({
    defaultValues: {
      timePeriod: "allTime",
    },
  });
  const formatPrice = useFormatPrice();
  const router = useRouter();

  const { timePeriod } = watch();

  // Fetch seller analytics
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useGetSellerAnalyticsQuery({ timePeriod });
  // Fetch recent orders
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
  } = useGetSellerOrdersQuery({ page: 1, limit: 10 });

  // Fetch seller profile for store name
  const { data: profileData } = useGetSellerProfileQuery();
  const p = profileData?.sellerProfile;

  const storeName = p?.storeName || "Your Store";

  // Prepare top products data
  const topItems =
    analyticsData?.topProducts?.slice(0, 10).map((p) => ({
      id: p.id,
      name: p.name,
      subtitle: `${p.quantity ?? 0} sold`,
      primaryInfo: formatPrice(p.revenue ?? 0),
      secondaryInfo: p.category ?? "",
      image: p.imageUrl ?? "",
      quantity: p.quantity,
      revenue: formatPrice(p.revenue),
    })) || [];

  // Prepare sales by product data
  const salesByProduct = {
    categories: analyticsData?.topProducts?.map((p) => p.name) || [],
    data: analyticsData?.topProducts?.map((p) => p.revenue) || [],
  };

  // Recent orders table columns
  const orderColumns = [
    {
      key: "orderId",
      label: "Order ID",
      Ascendantly: false,
      sortable: true,
      render: (row: any) => (
        <span className="font-mono text-sm">{row.orderId?.substring(0, 8) || row.id?.substring(0, 8)}...</span>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      Ascendantly: false,
      sortable: true,
      render: (row: any) => (
        <div>
          <div className="font-medium">{row.customerName || "N/A"}</div>
          {row.customerEmail && (
            <div className="text-sm text-gray-500">{row.customerEmail}</div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      Ascendantly: false,
      sortable: true,
      render: (row: any) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case "PENDING":
              return "bg-yellow-100 text-yellow-800";
            case "PROCESSING":
              return "bg-blue-100 text-blue-800";
            case "SHIPPED":
              return "bg-indigo-100 text-indigo-800";
            case "IN_TRANSIT":
              return "bg-purple-100 text-purple-800";
            case "DELIVERED":
              return "bg-green-100 text-green-800";
            case "CANCELED":
              return "bg-red-100 text-red-800";
            default:
              return "bg-gray-100 text-gray-800";
          }
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              row.status
            )}`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      key: "total",
      label: "Total",
      Ascendantly: false,
      sortable: true,
      render: (row: any) => formatPrice(row.total || 0),
    },
    {
      key: "orderDate",
      label: "Date",
      Ascendantly: false,
      sortable: true,
      render: (row: any) => (
        <span>
          {row.orderDate
            ? new Date(row.orderDate).toLocaleDateString()
            : "N/A"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      Ascendantly: false,
      render: (row: any) => (
        <button
          onClick={() => router.push(`/seller/orders/${row.id || row.orderId}`)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View
        </button>
      ),
    },
  ];

  if (isLoadingAnalytics) {
    return <CustomLoader />;
  }

  if (analyticsError) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading dashboard data. Please try again later.
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 sm:p-6 min-h-screen space-y-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Store Name Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Store className="w-6 h-6" />
          <h2 className="text-lg sm:text-xl font-semibold">Your Store</h2>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">{storeName}</h1>
        <p className="text-indigo-100 mt-2 text-sm sm:text-base">
          Manage your products, orders, and sales
        </p>
      </div>

      {/* Time Period Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Dashboard Overview
        </h2>
        <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <Controller
            name="timePeriod"
            control={control}
            render={({ field }) => (
              <Dropdown
                onChange={field.onChange}
                options={[
                  { label: "Last 7 Days", value: "last7days" },
                  { label: "Last Month", value: "lastMonth" },
                  { label: "Last Year", value: "lastYear" },
                  { label: "All Time", value: "allTime" },
                ]}
                value={field.value}
                label="Time Period"
                className="w-full sm:min-w-[150px] sm:max-w-[200px]"
              />
            )}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(analyticsData?.totalRevenue || 0)}
          percentage={analyticsData?.revenueChange || 0}
          caption="since last period"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatsCard
          title="Total Orders"
          value={analyticsData?.totalOrders || 0}
          percentage={analyticsData?.ordersChange || 0}
          caption="since last period"
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <StatsCard
          title="Total Products"
          value={analyticsData?.totalProducts || 0}
          percentage={analyticsData?.productsChange || 0}
          caption="active products"
          icon={<Package className="w-5 h-5" />}
        />
        <StatsCard
          title="Pending Orders"
          value={analyticsData?.pendingOrders || 0}
          percentage={0}
          caption="awaiting action"
          icon={<BarChart2 className="w-5 h-5" />}
        />
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <button
              onClick={() => router.push("/seller/orders")}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View All
            </button>
          </div>
          <Table
            data={ordersData?.orders || []}
            columns={orderColumns}
            isLoading={isLoadingOrders}
            emptyMessage="No orders yet"
            showHeader={false}
            showPaginationDetails={false}
            showSearchBar={false}
          />
        </div>

        {/* Top Products */}
        <div>
          <ListCard
            title="Top Selling Products"
            viewAllLink="/seller/products"
            items={topItems}
            itemType="product"
          />
        </div>
      </div>

      {/* Revenue Trends Chart */}
      {analyticsData?.monthlyTrends && (
        <AreaChart
          title="Revenue Trends"
          data={analyticsData.monthlyTrends.revenue || []}
          categories={analyticsData.monthlyTrends.labels || []}
          color="#22c55e"
          percentageChange={analyticsData?.revenueChange}
        />
      )}

      {/* Sales by Product Chart */}
      {salesByProduct.data.length > 0 && (
        <BarChart
          title="Sales by Product"
          data={salesByProduct.data}
          categories={salesByProduct.categories}
          color="#4CAF50"
        />
      )}
    </motion.div>
  );
};

export default withSellerAuth(SellerDashboard);
