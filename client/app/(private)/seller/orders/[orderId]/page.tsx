"use client";

import { useParams, useRouter } from "next/navigation";
import ShippingAddressCard from "@/app/(private)/(user)/orders/ShippingAddressCard";
import OrderSummary from "@/app/(private)/(user)/orders/OrderSummary";
import OrderStatus from "@/app/(private)/(user)/orders/OrderStatus";
import OrderItems from "@/app/(private)/(user)/orders/OrderItems";
import {
  useGetSellerOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdateShippingInfoMutation,
} from "@/app/store/apis/OrderApi";
import CustomLoader from "@/app/components/feedback/CustomLoader";
import { useState, useEffect } from "react";
import useToast from "@/app/hooks/ui/useToast";
import Dropdown from "@/app/components/molecules/Dropdown";
import { ArrowLeft, Save } from "lucide-react";
import { motion } from "framer-motion";

const SellerOrderDetailPage = () => {
  const { orderId } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { data, isLoading, error } = useGetSellerOrderQuery(orderId as string);
  const order = data?.order;

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateOrderStatusMutation();
  const [updateShipping, { isLoading: isUpdatingShipping }] =
    useUpdateShippingInfoMutation();

  // Form state
  const [status, setStatus] = useState(
    order?.transaction?.status || order?.status || ""
  );
  const [trackingNumber, setTrackingNumber] = useState(
    order?.shipment?.trackingNumber || ""
  );
  const [shippingNotes, setShippingNotes] = useState(
    order?.shipment?.shippingNotes || ""
  );

  // Update form state when order data loads
  useEffect(() => {
    if (order) {
      setStatus(order.transaction?.status || order.status || "");
      setTrackingNumber(order.shipment?.trackingNumber || "");
      setShippingNotes(order.shipment?.shippingNotes || "");
    }
  }, [order]);

  const statusOptions = [
    { label: "PENDING", value: "PENDING" },
    { label: "PROCESSING", value: "PROCESSING" },
    { label: "SHIPPED", value: "SHIPPED" },
    { label: "IN_TRANSIT", value: "IN_TRANSIT" },
    { label: "DELIVERED", value: "DELIVERED" },
    { label: "CANCELED", value: "CANCELED" },
  ];

  const handleSaveStatus = async () => {
    try {
      await updateStatus({
        orderId: orderId as string,
        status,
      }).unwrap();
      showToast("Order status updated successfully", "success");
    } catch (err: any) {
      console.error("Failed to update status:", err);
      showToast(
        err?.data?.message || "Failed to update order status",
        "error"
      );
    }
  };

  const handleSaveShipping = async () => {
    try {
      await updateShipping({
        orderId: orderId as string,
        trackingNumber,
        shippingNotes,
      }).unwrap();
      showToast("Shipping information updated successfully", "success");
    } catch (err: any) {
      console.error("Failed to update shipping:", err);
      showToast(
        err?.data?.message || "Failed to update shipping information",
        "error"
      );
    }
  };

  if (isLoading) {
    return <CustomLoader />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Order
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t retrieve the order information. Please try again
            later.
          </p>
          <button
            onClick={() => router.push("/seller/orders")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Orders
          </button>
        </div>
      </div>
    );
  }

  // Filter order items to show only seller's products
  const sellerOrderItems = order.orderItems || [];

  // Create a modified order object with filtered items
  const sellerOrder = {
    ...order,
    orderItems: sellerOrderItems,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => router.push("/seller/orders")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Orders</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <OrderItems order={sellerOrder} />

          <div className="col-span-2 space-y-6">
            <OrderStatus order={sellerOrder} />

            <OrderSummary order={sellerOrder} />
          </div>

          <ShippingAddressCard order={sellerOrder} />
        </div>

        {/* Seller Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Manage Order
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Update Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <Dropdown
                  options={statusOptions}
                  value={status}
                  onChange={(value) => setStatus(value || "")}
                  className="w-full"
                />
              </div>
              <button
                onClick={handleSaveStatus}
                disabled={isUpdatingStatus}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {isUpdatingStatus ? "Saving..." : "Update Status"}
              </button>
            </div>

            {/* Shipping Information Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Notes
                </label>
                <textarea
                  value={shippingNotes}
                  onChange={(e) => setShippingNotes(e.target.value)}
                  placeholder="Add shipping notes (optional)"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                onClick={handleSaveShipping}
                disabled={isUpdatingShipping}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {isUpdatingShipping ? "Saving..." : "Update Shipping Info"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SellerOrderDetailPage;

