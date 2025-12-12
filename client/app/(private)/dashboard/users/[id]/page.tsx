"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import {
  useGetUserProfileQuery,
  useUpdateUserMutation,
  useReviewVerificationMutation,
  useGetUserVerificationDetailsQuery,
} from "@/app/store/apis/UserApi";
import useToast from "@/app/hooks/ui/useToast";

import UserForm, { UserFormData } from "../UserForm";
import { AdminActionGuard, PermissionGuard, RoleHierarchyGuard } from "@/app/components/auth";

const UserManagementPage = () => {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const userId = params.id as string;

  const { data: userData, isLoading: isLoadingUser, error } = useGetUserProfileQuery(userId);
  const { data: verificationData } = useGetUserVerificationDetailsQuery(userId);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [reviewVerification, { isLoading: isReviewing }] = useReviewVerificationMutation();

  const form = useForm<UserFormData>({
    defaultValues: {
      id: "",
      name: "",
      email: "",
      role: "USER",
      verificationStatus: undefined,
      rejectionReason: "",
      verificationImages: [],
    },
  });

  // Update form when user data loads
  React.useEffect(() => {
    if (userData) {
      // Handle verification images - collect both studentIdCard and feeChallan if they exist
      const verificationImages: string[] = [];
      if (verificationData?.user?.studentIdCard) {
        verificationImages.push(verificationData.user.studentIdCard);
      }
      if (verificationData?.user?.feeChallan) {
        verificationImages.push(verificationData.user.feeChallan);
      }

      form.reset({
        id: userData?.user?.id,
        name: userData?.user?.name,
        email: userData?.user?.email,
        role: userData?.user?.role,
        verificationStatus: verificationData?.user?.verificationStatus || userData?.user?.verificationStatus,
        rejectionReason: verificationData?.user?.rejectionReason || "",
        verificationImages: verificationImages,
      });
    }
  }, [userData, verificationData, form]);

  const onSubmit = async (data: UserFormData) => {
    try {
      // Handle verification status changes separately
      if (data.verificationStatus && data.verificationStatus !== verificationData?.user?.verificationStatus) {
        await reviewVerification({
          userId: data.id as string,
          status: data.verificationStatus,
          rejectionReason: data.verificationStatus === "REJECTED" ? data.rejectionReason : undefined,
        }).unwrap();
        showToast(`User verification ${data.verificationStatus.toLowerCase()} successfully`, "success");
      }

      // Handle regular user updates (excluding verification fields)
      const userUpdateData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      await updateUser(userUpdateData).unwrap();

      showToast("User updated successfully", "success");
      router.push("/dashboard/users");
    } catch (err: any) {
      console.error("Failed to update user:", err);
      const errorMessage = err?.data?.message || "Failed to update user";
      showToast(errorMessage, "error");
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !userData) {
    console.error("Error fetching user data:", error);
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">User not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The user you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <button
            onClick={() => router.push("/dashboard/users")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const getVerificationStatusDisplay = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: "Verified Student",
          color: "text-green-700 bg-green-100",
        };
      case "PENDING":
        return {
          icon: <Clock className="w-5 h-5 text-yellow-600" />,
          text: "Verification Pending",
          color: "text-yellow-700 bg-yellow-100",
        };
      case "REJECTED":
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          text: "Verification Rejected",
          color: "text-red-700 bg-red-100",
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-gray-600" />,
          text: "Not Verified",
          color: "text-gray-700 bg-gray-100",
        };
    }
  };

  const verificationDisplay = getVerificationStatusDisplay(verificationData?.user?.verificationStatus || userData?.user?.verificationStatus);

  return (
    <PermissionGuard requireAdmin={true}>
        <RoleHierarchyGuard
         targetUserRole={userData?.user?.role || 'USER'}
         targetUserId={userData?.user?.id || ''}
         showFallback={false}
       >
        <AdminActionGuard action="update_user" showFallback={false}>
          <div className="bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/dashboard/users")}
                  className="inline-flex items-center p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Manage User</h1>
                  <p className="text-gray-600">Edit user details and verification status</p>
                </div>
              </div>

              {/* Verification Status Badge */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${verificationDisplay.color}`}>
                {verificationDisplay.icon}
                <span className="ml-2">{verificationDisplay.text}</span>
              </div>
            </div>
          </div>

          {/* User Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <UserForm
              form={form}
              onSubmit={onSubmit}
              isLoading={isUpdating || isReviewing}
              submitLabel="Save Changes"
              verificationImages={(() => {
                const images: string[] = [];
                if (verificationData?.user?.studentIdCard) images.push(verificationData.user.studentIdCard);
                if (verificationData?.user?.feeChallan) images.push(verificationData.user.feeChallan);
                return images;
              })()}
            />
          </div>
        </motion.div>
      </div>
    </div>
        </AdminActionGuard>
      </RoleHierarchyGuard>
    </PermissionGuard>
  );
};

export default UserManagementPage;
