"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import { Users, Shield, CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import Image from "next/image";

export interface UserFormData {
  id: string | number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  verificationImages?: string[];
}

interface UserFormProps {
  form: UseFormReturn<UserFormData>;
  onSubmit: (data: UserFormData) => void;
  isLoading?: boolean;
  submitLabel?: string;
  verificationImages?: string[];
}

const UserForm: React.FC<UserFormProps> = ({
  form,
  onSubmit,
  isLoading,
  submitLabel = "Save",
  verificationImages = [],
}) => {
  const { user: currentUser } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

  

  // Get role color for display
  const getRoleColor = (role: string) => {
    const colors = {
      USER: "bg-blue-100 text-blue-800 border-blue-200",
      ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[role as keyof typeof colors] || colors.USER;
  };

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    if (!currentUser) return [];

    switch (currentUser.role) {
      case "ADMIN":
        return [
          { value: "USER", label: "User", icon: <Users className="w-4 h-4" /> },
          {
            value: "ADMIN",
            label: "Admin",
            icon: <Shield className="w-4 h-4" />,
          },
        ];
      default:
        return [
          { value: "USER", label: "User", icon: <Users className="w-4 h-4" /> },
        ];
    }
  };

  const availableRoles = getAvailableRoles();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <div className="relative">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="John Doe"
                disabled
                readOnly
              />
            )}
          />
          <Users className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>
        <p className="text-xs text-gray-500 mt-1">Name cannot be edited</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="john.doe@example.com"
              disabled
              readOnly
            />
          )}
        />
        <p className="text-xs text-gray-500 mt-1">Email cannot be edited</p>
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>

        <Controller
          name="role"
          control={control}
          rules={{ required: "Role is required" }}
          render={({ field }) => {
            const fieldValue = field.value; 

            return (
              <div className="space-y-2">
                <select
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value); 
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                >
                  {availableRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>

                {/* Role Preview */}
                {fieldValue && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                    {availableRoles.find((r) => r.value === fieldValue)?.icon}
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                        fieldValue
                      )}`}
                    >
                      {
                        availableRoles.find((r) => r.value === fieldValue)
                          ?.label
                      }
                    </span>
                  </div>
                )}
              </div>
            );
          }}
        />

        {errors.role && (
          <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
        )}
      </div>


      {/* Verification Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Verification Status
        </label>
        <Controller
          name="verificationStatus"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <select
                {...field}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                <option value="">Not Set</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              {/* Status Preview */}
              {field.value && (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                  {field.value === "APPROVED" && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {field.value === "PENDING" && <Clock className="w-4 h-4 text-yellow-600" />}
                  {field.value === "REJECTED" && <XCircle className="w-4 h-4 text-red-600" />}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      field.value === "APPROVED"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : field.value === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}
                  >
                    {field.value}
                  </span>
                </div>
              )}
            </div>
          )}
        />
      </div>

      {/* Verification Images */}
      {verificationImages && verificationImages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Images
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {verificationImages.map((image, index) => {
              // Determine image type based on URL or index
              const isStudentIdCard = image.toLowerCase().includes('studentid') || index === 0;
              const imageLabel = isStudentIdCard ? 'Student ID Card' : 'Fee Challan';
              console.log('Rendering verification image:', image, 'as', imageLabel);
              
              return (
                <div key={index} className="relative group">
                  <div 
                    className="w-full h-32 relative rounded-lg border border-gray-200 cursor-pointer transition-transform hover:scale-105 overflow-hidden"
                    onClick={() => window.open(image, '_blank', 'noopener,noreferrer')}
                  >
                    <Image
                      src={image}
                      alt={imageLabel}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', image);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-xs text-center p-2">Failed to load image</div>';
                        }
                      }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                      Click to view
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg pointer-events-none">
                    <p className="text-white text-xs font-medium truncate">{imageLabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">Click on any image to view full size</p>
        </div>
      )}

      {/* Rejection Reason - Show only when status is REJECTED */}
      {watch("verificationStatus") === "REJECTED" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason
          </label>
          <Controller
            name="rejectionReason"
            control={control}
            rules={{
              required: watch("verificationStatus") === "REJECTED" ? "Rejection reason is required when status is rejected" : false
            }}
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="Please provide a reason for rejection..."
              />
            )}
          />
          {errors.rejectionReason && (
            <p className="text-red-500 text-sm mt-1">{errors.rejectionReason.message}</p>
          )}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
