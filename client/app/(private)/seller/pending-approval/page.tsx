"use client";

import MainLayout from "@/app/components/templates/MainLayout";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

export default function SellerPendingApproval() {
  return (
    <MainLayout>
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            Seller Application Pending
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your seller application has been submitted and is currently under review.
          </p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-700">
                <strong>What happens next?</strong>
              </span>
            </div>
            <ul className="mt-3 text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Our team will review your application within 1-3 business days</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>You&apos;ll receive an email notification once a decision is made</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>You can continue shopping as a regular user while waiting</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800">
                Continue Shopping
              </h3>
              <p className="mt-2 text-sm text-blue-700">
                While your application is being reviewed, you can continue shopping as a regular user.
              </p>
              <a
                href="/shop"
                className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Shop
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}