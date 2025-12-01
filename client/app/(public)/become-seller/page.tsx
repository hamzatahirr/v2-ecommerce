"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Store,
  CheckCircle,
  TrendingUp,
  Users,
  Shield,
  ArrowRight,
  Loader2,
} from "lucide-react";
import MainLayout from "@/app/components/templates/MainLayout";
import Input from "@/app/components/atoms/Input";
import TextArea from "@/app/components/atoms/TextArea";
import Button from "@/app/components/atoms/Button";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import useToast from "@/app/hooks/ui/useToast";
import CustomLoader from "@/app/components/feedback/CustomLoader";
import { useBecomeSellerMutation } from "@/app/store/apis/SellerApi";
import { useAppDispatch } from "@/app/store/hooks";
import { setUser } from "@/app/store/slices/AuthSlice";

interface BecomeSellerForm {
  storeName: string;
  description: string;
  phone: string;
  businessAddress: string;
}

const BecomeSeller = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isSeller } = useAuth();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  const [becomeSeller, { isLoading: isSubmitting }] = useBecomeSellerMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BecomeSellerForm>({
    defaultValues: {
      storeName: "",
      description: "",
      phone: "",
      businessAddress: "",
    },
  });

  // Redirect if already a seller
  useEffect(() => {
    if (!authLoading && isAuthenticated && isSeller) {
      router.push("/seller");
    }
  }, [authLoading, isAuthenticated, isSeller, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Don't redirect immediately, show login prompt instead
    }
  }, [authLoading, isAuthenticated]);

  const onSubmit = async (formData: BecomeSellerForm) => {
    try {
      // TESTING: Skip payment, directly create seller profile
      const result = await becomeSeller({
        storeName: formData.storeName,
        description: formData.description,
        phone: formData.phone,
        businessAddress: formData.businessAddress,
      }).unwrap();
                                                                                     
      // Update user in Redux store if user data is returned
      if (result.user) {
        dispatch(setUser({ user: result.user }));
      }

      showToast("Successfully became a seller! Welcome to the seller community.", "success");
      
      // Redirect to seller dashboard
      setTimeout(() => {
        router.push("/seller");
      }, 1500);
    } catch (err: any) {
      console.error("Failed to become seller:", err);
      showToast(
        err?.data?.message || "Failed to become a seller. Please try again.",
        "error"
      );
    }
  };

  if (authLoading) {
    return (
      <MainLayout>
        <CustomLoader />
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Sign In Required
              </h2>
              <p className="text-gray-600">
                Please sign in to your account to become a seller.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/sign-in?redirect=/become-seller"
                className="block w-full py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors text-center"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="block w-full py-3 bg-gray-100 text-gray-800 rounded-md font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  const benefits = [
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Reach thousands of customers and increase your sales",
    },
    {
      icon: Users,
      title: "Build Your Brand",
      description: "Create your store and establish your online presence",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Safe and reliable marketplace for your products",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
              <Store className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
              Become a Seller
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our marketplace and start selling your products to customers
              worldwide
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Benefits Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Seller Benefits
                </h2>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 mb-1">
                            {benefit.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Payment Bypass Notice */}
                {process.env.NEXT_PUBLIC_BYPASS_PAYMENTS === "true" && (
                  <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      ⚠️ Testing Mode: Payment bypassed. Seller account will be
                      created directly.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Registration Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Store Information
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Store Name */}
                  <Input
                    control={control}
                    name="storeName"
                    label="Store Name"
                    placeholder="Enter your store name"
                    validation={{ required: "Store name is required" }}
                    error={errors.storeName?.message}
                    icon={Store}
                  />

                  {/* Store Description */}
                  <TextArea
                    control={control}
                    name="description"
                    label="Store Description"
                    placeholder="Describe your store and what you sell..."
                    rows={4}
                    validation={{ required: "Store description is required" }}
                    error={errors.description?.message}
                  />

                  {/* Phone Number */}
                  <Input
                    control={control}
                    name="phone"
                    label="Phone Number"
                    placeholder="+1 (555) 123-4567"
                    type="tel"
                    validation={{ required: "Phone number is required" }}
                    error={errors.phone?.message}
                  />

                  {/* Business Address */}
                  <TextArea
                    control={control}
                    name="businessAddress"
                    label="Business Address"
                    placeholder="Enter your business address"
                    rows={3}
                    validation={{ required: "Business address is required" }}
                    error={errors.businessAddress?.message}
                  />

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed px-6 py-3 font-medium transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <span>Become a Seller</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Terms Notice */}
                  <p className="text-xs text-gray-500 text-center">
                    By becoming a seller, you agree to our{" "}
                    <Link href="/terms" className="text-indigo-600 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-indigo-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BecomeSeller;

