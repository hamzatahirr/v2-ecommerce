"use client";
import { useGetUserVerificationDetailsQuery } from "@/app/store/apis/UserApi";
import { useAuth } from "@/app/hooks/useAuth";
import MainLayout from "@/app/components/templates/MainLayout";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Eye,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

const VerificationStatusPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { data, isLoading, error } = useGetUserVerificationDetailsQuery(user?.id || "", {
    skip: !user?.id,
  });
  const verificationData = data?.user;
  console.log("Verification Data:", verificationData);

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          title: "Verified Student",
          description: "Your account has been verified successfully!",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
        };
      case "PENDING":
        return {
          icon: <Clock className="w-8 h-8 text-yellow-600" />,
          title: "Verification Pending",
          description: "Your documents are being reviewed by our admin team.",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
        };
      case "REJECTED":
        return {
          icon: <XCircle className="w-8 h-8 text-red-600" />,
          title: "Verification Rejected",
          description: "Your verification request was not approved.",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
        };
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-gray-600" />,
          title: "Not Verified",
          description: "Complete your verification to access all features.",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
        };
    }
  };

  const statusConfig = getStatusConfig(verificationData?.verificationStatus);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading verification status</h3>
            <p className="mt-1 text-sm text-gray-500">Please try again later.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Verification Status</h1>
              <p className="mt-2 text-lg text-gray-600">
                Track your verification process
              </p>
            </div>

            {/* Status Card */}
            <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-xl p-8`}>
              <div className="flex items-center space-x-4">
                {statusConfig.icon}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{statusConfig.title}</h2>
                  <p className="text-gray-600 mt-1">{statusConfig.description}</p>
                </div>
              </div>
            </div>

            {/* Verification Details */}
            {verificationData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Verification Details</h3>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status Timeline */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${verificationData.verificationStatus === "APPROVED" ? "bg-green-500" : verificationData.verificationStatus === "PENDING" ? "bg-yellow-500" : verificationData.verificationStatus === "REJECTED" ? "bg-red-500" : "bg-gray-400"}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {verificationData.verificationStatus === "APPROVED" ? "Verification Approved" :
                           verificationData.verificationStatus === "PENDING" ? "Under Review" :
                           verificationData.verificationStatus === "REJECTED" ? "Verification Rejected" : "Not Submitted"}
                        </p>
                        {verificationData.verificationReviewedAt && (
                          <p className="text-xs text-gray-500">
                            {new Date(verificationData.verificationReviewedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {verificationData.verificationSubmittedAt && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Documents Submitted</p>
                          <p className="text-xs text-gray-500">
                            {new Date(verificationData.verificationSubmittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rejection Reason */}
                  {verificationData.verificationStatus === "REJECTED" && verificationData.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800">Rejection Reason</h4>
                          <p className="text-sm text-red-700 mt-1">{verificationData.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submitted Documents */}
                  {(verificationData.studentIdCard || verificationData.feeChallan) && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">Submitted Documents</h4>

                      {verificationData.studentIdCard && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">Student Card / Fee challan</span>
                          </div>
                          <a
                            href={verificationData.studentIdCard}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">View</span>
                          </a>
                        </div>
                      )}

                      {verificationData.feeChallan && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">Fee Challan</span>
                          </div>
                          <a
                            href={verificationData.feeChallan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">View</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Admin Info */}
                  {verificationData.verificationReviewedByUser && (
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Reviewed by: {verificationData.verificationReviewedByUser.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {verificationData.verificationReviewedByUser.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              {verificationData?.verificationStatus === "REJECTED" && (
                <button
                  onClick={() => router.push("/verification")}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-submit Documents
                </button>
              )}

              {verificationData?.verificationStatus === "PENDING" && (
                <button
                  onClick={() => router.push("/verification")}
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Update Documents
                </button>
              )}

              {!verificationData?.verificationStatus && (
                <button
                  onClick={() => router.push("/verification")}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Verification
                </button>
              )}

              <button
                onClick={() => router.push("/profile")}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Profile
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VerificationStatusPage;
