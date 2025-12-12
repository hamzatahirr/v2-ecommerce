"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Info,
  XCircle,
} from "lucide-react";
import { useSubmitVerificationMutation, useGetUserVerificationDetailsQuery } from "@/app/store/apis/UserApi";
import { useAuth } from "@/app/hooks/useAuth";
import useToast from "@/app/hooks/ui/useToast";
import MainLayout from "@/app/components/templates/MainLayout";
import Image from "next/image";

interface VerificationFormData {
  studentIdCard?: FileList;
  feeChallan?: FileList;
}

const VerificationPage = () => {
  const [submitVerification, { isLoading }] = useSubmitVerificationMutation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  
  // Fetch existing verification details
  const { data: verificationData, isLoading: isLoadingVerification } = useGetUserVerificationDetailsQuery(user?.id || '', {
    skip: !user?.id,
  });

  // State hooks - must be called before any early returns
  const [selectedFiles, setSelectedFiles] = useState<{
    studentIdCard?: File;
    feeChallan?: File;
  }>({});
  const [previewUrls, setPreviewUrls] = useState<{
    studentIdCard?: string;
    feeChallan?: string;
  }>({});
  
  // State to track removed existing images
  const [removedImages, setRemovedImages] = useState<{
    studentIdCard?: boolean;
    feeChallan?: boolean;
  }>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<VerificationFormData>();



  // Early returns after all hooks are called
  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please log in to access the verification page.</p>
            <button
              onClick={() => router.push('/sign-in')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleFileSelect = (
    fieldName: 'studentIdCard' | 'feeChallan',
    files: FileList | null
  ) => {
    if (!files || files.length === 0) {
      setSelectedFiles(prev => ({ ...prev, [fieldName]: undefined }));
      setPreviewUrls(prev => ({ ...prev, [fieldName]: undefined }));
      return;
    }

    const file = files[0];

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError(fieldName, {
        type: 'manual',
        message: 'Please select a valid image file (JPG, PNG) or PDF.'
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(fieldName, {
        type: 'manual',
        message: 'File size must be less than 5MB.'
      });
      return;
    }

    setSelectedFiles(prev => ({ ...prev, [fieldName]: file }));

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [fieldName]: url }));
    } else {
      setPreviewUrls(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const removeFile = (fieldName: 'studentIdCard' | 'feeChallan') => {
    setSelectedFiles(prev => ({ ...prev, [fieldName]: undefined }));
    setPreviewUrls(prev => ({ ...prev, [fieldName]: undefined }));
  };

  const onSubmit = async () => {
    // Check if there are any new files to upload or existing images that weren't removed
    const hasNewFiles = selectedFiles.studentIdCard || selectedFiles.feeChallan;
    const hasExistingImages = 
      (verificationData?.user?.studentIdCard && !removedImages.studentIdCard) ||
      (verificationData?.user?.feeChallan && !removedImages.feeChallan);

    if (!hasNewFiles && !hasExistingImages) {
      showToast("Please upload at least one document", "error");
      return;
    }

    if (!hasNewFiles && hasExistingImages) {
      showToast("No new documents to submit. Your existing documents are still under review.", "info");
      return;
    }

    try {
      const formData = new FormData();

      if (selectedFiles.studentIdCard) {
        formData.append('studentIdCard', selectedFiles.studentIdCard);
      }

      if (selectedFiles.feeChallan) {
        formData.append('feeChallan', selectedFiles.feeChallan);
      }

      await submitVerification(formData).unwrap();

      showToast("Verification documents submitted successfully! Please wait for admin approval.", "success");

      // Redirect to home or profile page
      router.push("/");

    } catch (error: any) {
      console.error("Verification submission error:", error);
      const errorMessage = error?.data?.message || "Failed to submit verification documents";
      showToast(errorMessage, "error");
    }
  };

  const ExistingVerificationImages = () => {
    if (!verificationData?.user || isLoadingVerification) return null;

    const existingImages: Array<{ url: string; type: 'studentIdCard' | 'feeChallan'; label: string }> = [];
    
    if (verificationData.user.studentIdCard && !removedImages.studentIdCard) {
      existingImages.push({
        url: verificationData.user.studentIdCard,
        type: 'studentIdCard',
        label: 'Student ID Card'
      });
    }
    
    if (verificationData.user.feeChallan && !removedImages.feeChallan) {
      existingImages.push({
        url: verificationData.user.feeChallan,
        type: 'feeChallan',
        label: 'Fee Challan'
      });
    }

    if (existingImages.length === 0) return null;

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your Submitted Documents</h3>
          <p className="text-sm text-gray-600 mb-4">
            {verificationData.user.verificationStatus === 'PENDING' && 'Your documents are under review.'}
            {verificationData.user.verificationStatus === 'APPROVED' && 'Your verification has been approved!'}
            {verificationData.user.verificationStatus === 'REJECTED' && 'Your verification was rejected. You can resubmit new documents.'}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {existingImages.map((image, index) => (
            <div key={index} className="relative group">
              <div 
                className="w-full h-32 relative rounded-lg border border-gray-200 cursor-pointer transition-transform hover:scale-105 overflow-hidden"
                onClick={() => window.open(image.url, '_blank', 'noopener,noreferrer')}
              >
                <Image
                  src={image.url}
                  alt={image.label}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', image.url);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-xs text-center p-2">Failed to load image</div>';
                    }
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                <span className="text-white opacity-0 group-hover:opacity-100 text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                  Click to view
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg pointer-events-none">
                <p className="text-white text-xs font-medium truncate">{image.label}</p>
              </div>
              
              {/* Remove button - only show if verification is not approved */}
              {verificationData.user.verificationStatus !== 'APPROVED' && (
                <button
                  type="button"
                  onClick={() => {
                    setRemovedImages(prev => ({ ...prev, [image.type]: true }));
                    // Also clear any selected file for this type
                    setSelectedFiles(prev => ({ ...prev, [image.type]: undefined }));
                    setPreviewUrls(prev => ({ ...prev, [image.type]: undefined }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remove this document"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Click on any image to view full size</p>
      </div>
    );
  };

  const FilePreview = ({
    file,
    previewUrl,
    fieldName,
    label
  }: {
    file?: File;
    previewUrl?: string;
    fieldName: 'studentIdCard' | 'feeChallan';
    label: string;
  }) => {
    if (!file) return null;

    return (
      <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {previewUrl ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={previewUrl}
                  alt={label}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-500">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              {file.type.startsWith('image/') && (
                <p className="text-xs text-green-600">✓ Image file</p>
              )}
              {file.type === 'application/pdf' && (
                <p className="text-xs text-blue-600">✓ PDF file</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeFile(fieldName)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const FileUploadArea = ({
    fieldName,
    label,
    description,
    register,
    error
  }: {
    fieldName: 'studentIdCard' | 'feeChallan';
    label: string;
    description: string;
    register: any;
    error?: string;
  }) => {
    const hasFile = !!selectedFiles[fieldName];
    const hasExistingImage = verificationData?.user?.[fieldName] && !removedImages[fieldName];
    const isVerificationApproved = verificationData?.user?.verificationStatus === 'APPROVED';

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {!isVerificationApproved && <span className="text-red-500">*</span>}
        </label>

        {hasFile ? (
          <FilePreview
            file={selectedFiles[fieldName]}
            previewUrl={previewUrls[fieldName]}
            fieldName={fieldName}
            label={label}
          />
        ) : hasExistingImage ? (
          <div className="relative bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">{label} submitted</p>
                <p className="text-xs text-green-600">
                  {isVerificationApproved ? 'Document verified and approved' : 'Document submitted for verification'}
                </p>
              </div>
            </div>
            {!isVerificationApproved && (
              <button
                type="button"
                onClick={() => {
                  setRemovedImages(prev => ({ ...prev, [fieldName]: true }));
                }}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove and upload new document"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              {...register(fieldName)}
              onChange={(e) => handleFileSelect(fieldName, e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isVerificationApproved}
            />
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isVerificationApproved 
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                : 'border-gray-300 hover:border-indigo-400 cursor-pointer'
            }`}>
              <Upload className={`mx-auto h-12 w-12 ${isVerificationApproved ? 'text-gray-300' : 'text-gray-400'}`} />
              <div className="mt-4">
                <p className={`text-sm font-medium ${isVerificationApproved ? 'text-gray-500' : 'text-gray-900'}`}>
                  {isVerificationApproved 
                    ? `${label} already verified`
                    : `Click to upload ${label.toLowerCase()}`
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isVerificationApproved 
                    ? 'Your document has been approved'
                    : description
                  }
                </p>
                {!isVerificationApproved && (
                  <p className="text-xs text-gray-400 mt-2">
                    JPG, PNG, PDF up to 5MB
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Verification</h1>
                  <p className="text-indigo-100 mt-1">
                    Complete your verification to access all platform features
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              {/* Existing Images */}
              <ExistingVerificationImages />
              
              {/* Info Alert */}
              <div className={`border rounded-lg p-4 mb-6 ${
                verificationData?.user?.verificationStatus === 'APPROVED' 
                  ? 'bg-green-50 border-green-200' 
                  : verificationData?.user?.verificationStatus === 'REJECTED'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start space-x-3">
                  {verificationData?.user?.verificationStatus === 'APPROVED' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : verificationData?.user?.verificationStatus === 'REJECTED' ? (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  )}
                  <div className={`text-sm ${
                    verificationData?.user?.verificationStatus === 'APPROVED' 
                      ? 'text-green-800' 
                      : verificationData?.user?.verificationStatus === 'REJECTED'
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }`}>
                    <p className="font-medium">
                      {verificationData?.user?.verificationStatus === 'APPROVED' 
                        ? 'Verification Approved'
                        : verificationData?.user?.verificationStatus === 'REJECTED'
                        ? 'Verification Rejected'
                        : 'Verification Required'
                      }
                    </p>
                    <p className="mt-1">
                      {verificationData?.user?.verificationStatus === 'APPROVED' 
                        ? 'Your student status has been verified. You now have access to all platform features.'
                        : verificationData?.user?.verificationStatus === 'REJECTED'
                        ? `Your verification was rejected. ${verificationData?.user?.rejectionReason ? `Reason: ${verificationData.user.rejectionReason}` : 'You can resubmit your documents below.'}`
                        : 'As a campus e-commerce platform, we need to verify your student status. Please upload your student ID card and/or fee challan for verification. Our admin team will review your documents within 24-48 hours.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Form - Only show if verification is not approved */}
              {verificationData?.user?.verificationStatus !== 'APPROVED' && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FileUploadArea
                  fieldName="studentIdCard"
                  label="Student ID Card"
                  description="Upload a clear photo of your student ID card"
                  register={register}
                  error={errors.studentIdCard?.message}
                />

                <FileUploadArea
                  fieldName="feeChallan"
                  label="Fee Challan"
                  description="Upload your latest fee challan or payment receipt"
                  register={register}
                  error={errors.feeChallan?.message}
                />

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || (!selectedFiles.studentIdCard && !selectedFiles.feeChallan)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isLoading ? "Submitting..." : "Submit for Verification"}</span>
                  </button>
                </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VerificationPage;
