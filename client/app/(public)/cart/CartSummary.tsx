"use client";
import { useInitiateCheckoutMutation } from "@/app/store/apis/CheckoutApi";
import React, { useMemo, useState } from "react";
import useToast from "@/app/hooks/ui/useToast";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import AddressForm, { AddressFormData } from "@/app/components/molecules/AddressForm";

interface CartSummaryProps {
  subtotal: number;
  shippingRate?: number;
  currency?: string;
  totalItems: number;
  cartId: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  shippingRate = 0.01,
  currency = "$",
  totalItems,
  cartId,
}) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [initiateCheckout, { isLoading: isCheckoutLoading }] = useInitiateCheckoutMutation();

  const shippingFee = useMemo(() => subtotal * shippingRate, [subtotal, shippingRate]);
  const total = useMemo(() => subtotal + shippingFee, [subtotal, shippingFee]);

  const isLoading = isCheckoutLoading;

  const [paymentMethod, setPaymentMethod] = React.useState<
    "JAZZCASH" | "CASH_ON_DELIVERY"
  >("CASH_ON_DELIVERY");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState<AddressFormData | null>(null);

  // ENV flag to disable JazzCash
  const isJazzCashDisabled =
    process.env.NEXT_PUBLIC_BYPASS_PAYMENTS === "true";

  // Safety: If JazzCash is disabled but was previously selected, revert to COD
  React.useEffect(() => {
    if (isJazzCashDisabled && paymentMethod === "JAZZCASH") {
      setPaymentMethod("CASH_ON_DELIVERY");
    }
  }, [isJazzCashDisabled, paymentMethod]);

  const handleAddressSubmit = (data: AddressFormData) => {
    setAddressData(data);
    setShowAddressForm(false);
    handleInitiateCheckout(data);
  };

  const handleInitiateCheckout = async (address?: AddressFormData) => {
    try {
      const finalAddress = address || addressData;
      
      // Build the checkout data with proper typing
      const checkoutData = {
        paymentMethod: paymentMethod,
        ...(finalAddress && { address: finalAddress }), // Only include address if it exists
      };

      const result = await initiateCheckout(checkoutData).unwrap();

      if (paymentMethod === "CASH_ON_DELIVERY") {
        showToast("COD order placed successfully!", "success");
        if (result.orders && result.orders.length > 0) {
          router.push(`/success?type=order&orderId=${result.orders[0].id}`);
        } else {
          router.push(`/success?type=order`);
        }
      } else if (paymentMethod === "JAZZCASH" && result.paymentUrl) {
        showToast("Redirecting to JazzCash payment...", "info");
        window.location.href = result.paymentUrl;
      } else if (paymentMethod === "JAZZCASH" && result.mockResponse) {
        showToast("JazzCash payment successful!", "success");
        router.push(`/success?type=payment`);
      }
    } catch (error: any) {
      console.error("Failed to initiate checkout:", error);
      showToast(error?.data?.message || "Failed to initiate checkout", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Order Summary
      </h2>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method
        </label>

        <div className="space-y-3">
          {/* CASH ON DELIVERY */}
          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 bg-blue-50 border-blue-200">
            <input
              type="radio"
              name="paymentMethod"
              value="CASH_ON_DELIVERY"
              checked={paymentMethod === "CASH_ON_DELIVERY"}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as "JAZZCASH" | "CASH_ON_DELIVERY"
                )
              }
              className="mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">Cash on Delivery</span>
              <span className="text-sm text-gray-500 ml-2">
                (Pay when you receive your order)
              </span>
              <div className="text-xs text-green-600 mt-1">
                ✓ Currently Available
              </div>
            </div>
          </label>

          {/* JAZZCASH */}
          <label
            className={`flex items-center p-3 border border-gray-200 rounded-lg 
              ${
                isJazzCashDisabled
                  ? "cursor-not-allowed opacity-50 hover:bg-transparent"
                  : "cursor-pointer hover:bg-gray-50"
              }
            `}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="JAZZCASH"
              checked={paymentMethod === "JAZZCASH"}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as "JAZZCASH" | "CASH_ON_DELIVERY"
                )
              }
              className="mr-3"
              disabled={isJazzCashDisabled}
            />
            <div>
              <span className="font-medium text-gray-900">JazzCash</span>
              <span className="text-sm text-gray-500 ml-2">
                (Pay with JazzCash mobile account)
              </span>

              {isJazzCashDisabled ? (
                <div className="text-xs text-red-600 mt-1">
                  Currently Unavailable
                </div>
              ) : (
                <div className="text-xs text-green-600 mt-1">✓ Available</div>
              )}
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between text-gray-700">
          <span>Total Items</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span className="font-medium text-gray-800">
            {currency}
            {subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Shipping ({(shippingRate * 100).toFixed(0)}%)</span>
          <span className="font-medium text-gray-800">
            {currency}
            {shippingFee.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between pt-3 border-t border-gray-200">
          <span className="font-semibold text-gray-800">Total</span>
          <span className="font-semibold text-gray-800">
            {currency}
            {total.toFixed(2)}
          </span>
        </div>
      </div>

      {isAuthenticated ? (
        <button
          disabled={isLoading || totalItems === 0}
          onClick={() => {
            if (addressData) {
              handleInitiateCheckout();
            } else {
              setShowAddressForm(true);
            }
          }}
          className="mt-4 w-full bg-indigo-600 text-white py-2.5 rounded-md font-medium text-sm hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading
            ? paymentMethod === "JAZZCASH"
              ? "Processing Payment..."
              : "Placing Order..."
            : addressData
            ? paymentMethod === "JAZZCASH"
              ? "Pay with JazzCash"
              : "Place COD Order"
            : "Enter Shipping Address"}
        </button>
      ) : (
        <Link
          href="/sign-in"
          className="mt-4 w-full inline-block text-center bg-gray-300 text-gray-800 py-2.5 rounded-md font-medium text-sm hover:bg-gray-400 transition-colors"
        >
          Sign in to Checkout
        </Link>
      )}

      {/* Address Form Modal/Overlay */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Enter Shipping Address
                </h3>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <AddressForm
                onSubmit={handleAddressSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CartSummary;