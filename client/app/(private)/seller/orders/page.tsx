"use client";

import React from "react";
import { useGetSellerOrdersQuery, useAcceptOrderMutation, useRejectOrderMutation, useShipOrderMutation, useCompleteOrderMutation } from "@/app/store/apis/SellerApi";
import { motion } from "framer-motion";
import {
  Package,
  Calendar,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  User,
  Store,
} from "lucide-react";
import Link from "next/link";
import OrderCardSkeleton from "@/app/components/feedback/OrderCardSkeleton";
import OrderFilters from "@/app/components/molecules/OrderFilters";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      ACCEPTED: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      REJECTED: { color: "bg-red-100 text-red-800", icon: XCircle },
      PROCESSING: { color: "bg-indigo-100 text-indigo-800", icon: Clock },
      SHIPPED: { color: "bg-purple-100 text-purple-800", icon: Truck },
      DELIVERED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      CANCELLED: { color: "bg-red-100 text-red-800", icon: XCircle },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <div
      className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${config.color}`}
    >
      <IconComponent size={12} className="sm:w-3 sm:h-3 mr-1" />
      <span className="hidden sm:inline">{status.replace("_", " ")}</span>
      <span className="sm:hidden">
        {status.replace("_", " ").split(" ")[0]}
      </span>
    </div>
  );
};

// Order card component
const OrderCard = ({ order }: { order: any }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getItemCount = (orderItems: any[]) => {
    return (
      orderItems?.reduce(
        (total: number, item: any) => total + item.quantity,
        0
      ) || 0
    );
  };

  const truncateId = (id: string) => {
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  const [acceptOrder] = useAcceptOrderMutation();
  const [rejectOrder] = useRejectOrderMutation();
  const [shipOrder] = useShipOrderMutation();
  const [completeOrder] = useCompleteOrderMutation();

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await acceptOrder(orderId).unwrap();
    } catch (error) {
      console.error("Failed to accept order:", error);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await rejectOrder(orderId).unwrap();
    } catch (error) {
      console.error("Failed to reject order:", error);
    }
  };

  const handleShipOrder = async (orderId: string) => {
    try {
      await shipOrder(orderId).unwrap();
    } catch (error) {
      console.error("Failed to ship order:", error);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await completeOrder(orderId).unwrap();
    } catch (error) {
      console.error("Failed to complete order:", error);
    }
  };

  const getActionButtons = (status: string, orderId: string) => {
    switch (status) {
      case "PENDING":
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleAcceptOrder(orderId)}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs sm:text-sm"
            >
              Accept
            </button>
            <button
              onClick={() => handleRejectOrder(orderId)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs sm:text-sm"
            >
              Reject
            </button>
          </div>
        );
      case "ACCEPTED":
        return (
          <button
            onClick={() => handleShipOrder(orderId)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs sm:text-sm"
          >
            Ship
          </button>
        );
      case "SHIPPED":
        return (
          <button
            onClick={() => handleCompleteOrder(orderId)}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs sm:text-sm"
          >
            Complete
          </button>
        );
      default:
        return null;
    }
  };

  // Get customer name from order
  const customerName =
    order.user?.name || order.customerName || "Customer";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2 sm:mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
              <Package
                size={14}
                className="sm:w-4 sm:h-4 text-gray-500 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                Order #{truncateId(order.id)}
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
              <span className="text-xs sm:text-sm text-gray-500">
                Customer: {customerName}
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Calendar
                size={12}
                className="sm:w-3 sm:h-3 text-gray-400 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm text-gray-500 truncate">
                {formatDate(order.orderDate || order.createdAt)}
              </span>
            </div>
          </div>
          <StatusBadge status={order.transaction?.status || order.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Customer Info */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <User size={14} className="text-gray-400" />
            <span className="text-xs sm:text-sm text-gray-600">Customer</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {order.user?.name || customerName}
          </div>
          {order.user?.email && (
            <div className="text-xs text-gray-500">{order.user.email}</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <DollarSign
              size={14}
              className="sm:w-4 sm:h-4 text-green-500 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                {formatCurrency(order.amount || order.total || 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <ShoppingBag
              size={14}
              className="sm:w-4 sm:h-4 text-blue-500 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Items</p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900">
                {getItemCount(order.orderItems)}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items Preview */}
        {order.orderItems && order.orderItems.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <p className="text-xs text-gray-500 mb-1 sm:mb-2">Items:</p>
            <div className="space-y-1">
              {order.orderItems.slice(0, 2).map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs sm:text-sm"
                >
                  <span className="text-gray-700 truncate flex-1 mr-2">
                    {item.variant?.product?.name || item.product?.name || "Product"}
                    {item.quantity > 1 && ` (×${item.quantity})`}
                  </span>
                  <span className="text-gray-500 font-medium text-xs sm:text-sm flex-shrink-0">
                    {formatCurrency(
                      (item.price || item.variant?.price || 0) * item.quantity
                    )}
                  </span>
                </div>
              ))}
              {order.orderItems.length > 2 && (
                <p className="text-xs text-gray-400">
                  +{order.orderItems.length - 2} more items
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          {getActionButtons(order.status, order.id)}
          <Link
            href={`/seller/orders/${order.id}`}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const SellerOrders = () => {
  // Filter and sort state
  const [statusFilter, setStatusFilter] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const { data, isLoading, error } = useGetSellerOrdersQuery({
    page: 1,
    limit: 10,
    status: statusFilter || undefined,
  });
  const orders = data?.orders || [];

  // Filter and sort orders
  const filteredAndSortedOrders = React.useMemo(() => {
    let filtered = orders;

    // Apply sort order
    filtered = [...filtered].sort((a: any, b: any) => {
      const dateA = new Date(a.orderDate || a.createdAt).getTime();
      const dateB = new Date(b.orderDate || b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [orders, sortOrder]);

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-8"
      >
        <Store size={20} className="sm:w-6 sm:h-6 text-indigo-500" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Your Orders
        </h1>
      </motion.div>

      {/* Filters */}
      {!isLoading && orders.length > 0 && (
        <OrderFilters
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(6)].map((_, index) => (
            <OrderCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-lg text-red-500">
            Error loading orders: {"Unknown error"}
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg text-gray-600">You have no orders yet</p>
        </div>
      ) : filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <Package
            size={40}
            className="sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4"
          />
          <p className="text-base sm:text-lg text-gray-600">
            No orders match your filters
          </p>
          <button
            onClick={() => setStatusFilter("")}
            className="mt-3 sm:mt-4 inline-block text-indigo-500 hover:text-indigo-600 font-medium transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {filteredAndSortedOrders.map((order: any) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
