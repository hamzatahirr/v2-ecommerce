"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const PaymentBypassBanner = () => {
  const isBypassEnabled =
    process.env.NEXT_PUBLIC_BYPASS_PAYMENTS === "true";

  if (!isBypassEnabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4"
    >
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
        <p className="text-sm font-medium text-yellow-800">
          ⚠️ Testing Mode: Payments Bypassed
        </p>
      </div>
      <p className="mt-1 text-sm text-yellow-700">
        Orders will be created directly without payment processing.
      </p>
    </motion.div>
  );
};

export default PaymentBypassBanner;


