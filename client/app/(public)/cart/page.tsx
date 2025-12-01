"use client";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingCart, Headphones } from "lucide-react";
import Link from "next/link";

const PaymentSucceeded = () => {
  {/* TESTING: Payment bypassed - START */}

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Order Placed Successfully!
        </h1>

        <p className="text-gray-600 mb-8">
          Thank you for your order. We have received your payment and will process your order shortly.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Continue Shopping
          </Link>

          <Link
            href="/chat"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Headphones className="w-5 h-5" />
            Contact Support
          </Link>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Test Mode:</strong> This is a payment bypass for testing purposes.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSucceeded;
