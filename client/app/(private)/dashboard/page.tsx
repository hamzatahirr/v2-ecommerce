"use client";
import { BarChart2, Globe, Plus, User, Store, Shield } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState } from "react";

import { useAuth } from "@/app/hooks/useAuth";
import { useCreateDomainMutation } from "@/app/store/apis/AllowedDomainsApi";
import useToast from "@/app/hooks/ui/useToast";

// const AreaChart = dynamic(
//   () => import("@/app/components/charts/AreaChartComponent"),
//   { ssr: false }
// );
// const BarChart = dynamic(
//   () => import("@/app/components/charts/BarChartComponent"),
//   { ssr: false }
// );

// interface FormData {
//   timePeriod: string;
//   year?: string;
//   startDate?: string;
//   endDate?: string;
//   useCustomRange?: boolean;
// }

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [createDomain] = useCreateDomainMutation();
  const [domainForm, setDomainForm] = useState({ domain: "" });
  const [showDomainForm, setShowDomainForm] = useState(false);

  const handleAddDomain = async () => {
    if (!domainForm.domain.trim()) {
      showToast("Please enter a domain", "error");
      return;
    }

    try {
      await createDomain({
        domain: domainForm.domain.trim()
      }).unwrap();
      
      showToast("Domain added successfully", "success");
      setDomainForm({ domain: "" });
      setShowDomainForm(false);
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to add domain", "error");
    }
  };

  // const { control, watch } = useForm<FormData>({
  //   defaultValues: {
  //     timePeriod: "allTime",
  //     useCustomRange: false,
  //   },
  // });
  // const formatPrice = useFormatPrice();

  // const timePeriodOptions = [
  //   { label: "Last 7 Days", value: "last7days" },
  //   { label: "Last Month", value: "lastMonth" },
  //   { label: "Last Year", value: "lastYear" },
  //   { label: "All Time", value: "allTime" },
  // ];

  // const { timePeriod } = watch();

  // const queryParams = {
  //   timePeriod: timePeriod || "allTime",
  // };

  // const { data, loading, error } = useQuery(GET_ANALYTICS_OVERVIEW, {
  //   variables: { params: queryParams },
  // });

  // const topItems =
  //   data?.productPerformance?.slice(0, 10).map((p) => ({
  //     id: p.id,
  //     name: p.name,
  //     quantity: p.quantity,
  //     revenue: formatPrice(p.revenue),
  //   })) || [];

  // const salesByProduct = {
  //   categories: data?.productPerformance?.map((p) => p.name) || [],
  //   data: data?.productPerformance?.map((p) => p.revenue) || [],
  // };

  // if (loading) {
  //   return <CustomLoader />;
  // }

  // if (error) {
  //   return (
  //     <div className="text-center text-red-500 p-4">
  //       Error loading dashboard data
  //     </div>
  //   );
  // }

  return (
    <motion.div
      className="p-4 sm:p-6 min-h-screen space-y-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {user?.role === 'ADMIN' ? 'Administrator Dashboard' : 
             user?.isSeller ? 'Seller Dashboard' : 'User Dashboard'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDomainForm(!showDomainForm)}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-300 flex items-center gap-2"
          >
            <Globe size={18} />
            <span className="hidden sm:inline">Add Domain</span>
          </button>
        </div>
      </div>

      {/* App Description */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-start gap-4">
          <Store className="w-8 h-8 text-blue-600 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Multi-Vendor E-Commerce Platform
            </h2>
            <p className="text-gray-700 leading-relaxed">
              A comprehensive marketplace solution that empowers multiple sellers to showcase and sell their products. 
              Our platform provides robust seller management, commission tracking, inventory control, and seamless 
              customer experiences. Built with modern technology to scale your business efficiently.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure Transactions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-blue-600" />
                <span>Multi-Role Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart2 className="w-4 h-4 text-purple-600" />
                <span>Real-time Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Domain Form */}
      {showDomainForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Add Allowed Domain</h3>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={domainForm.domain}
              onChange={(e) => setDomainForm({ domain: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="example.com"
            />
            <button
              onClick={handleAddDomain}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center gap-2"
            >
              <Plus size={18} />
              Add
            </button>
            <button
              onClick={() => {
                setShowDomainForm(false);
                setDomainForm({ domain: "" });
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Add domains that are allowed for user registration. This helps control access to your platform.
          </p>
        </motion.div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* <StatsCard
          title="Total Revenue"
          value={formatPrice(data?.revenueAnalytics?.totalRevenue || 0)}
          percentage={data?.revenueAnalytics?.changes?.revenue}
          caption="since last period"
          icon={<DollarSign className="w-5 h-5" />}
        /> */}
        {/* <StatsCard
          title="Total Sales"
          value={data?.orderAnalytics?.totalSales || 0}
          percentage={data?.orderAnalytics?.changes?.sales}
          caption="since last period"
          icon={<BarChart2 className="w-5 h-5" />}
        />
        <StatsCard
          title="Total Interactions"
          value={data?.interactionAnalytics?.totalInteractions || 0}
          percentage={0}
          caption="all interactions"
          icon={<LineChart className="w-5 h-5" />}
        />
        <StatsCard
          title="Total Users"
          value={data?.userAnalytics?.totalUsers || 0}
          percentage={data?.userAnalytics?.changes?.users}
          caption="since last period"
          icon={<Users className="w-5 h-5" />}
        /> */}
      </div>
      {/* <AreaChart
        title="Revenue Trends"
        data={data?.revenueAnalytics?.monthlyTrends?.revenue || []}
        categories={data?.revenueAnalytics?.monthlyTrends?.labels || []}
        color="#22c55e"
        percentageChange={data?.revenueAnalytics?.changes?.revenue}
      /> */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ListCard
          title="Top Products"
          viewAllLink="/shop"
          items={topItems}
          itemType="product"
        />
        <BarChart
          title="Sales by Product"
          data={salesByProduct.data}
          categories={salesByProduct.categories}
          color="#4CAF50"
        />
      </div> */}
    </motion.div>
  );
};

export default Dashboard;
