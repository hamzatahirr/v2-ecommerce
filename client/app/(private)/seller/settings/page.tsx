"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Store,
  CreditCard,
  Save,
  Upload,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";
import MainLayout from "@/app/components/templates/MainLayout";
import Input from "@/app/components/atoms/Input";
import TextArea from "@/app/components/atoms/TextArea";
import Button from "@/app/components/atoms/Button";
import Card from "@/app/components/molecules/Card";
import useToast from "@/app/hooks/ui/useToast";
import CustomLoader from "@/app/components/feedback/CustomLoader";
import {
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
  useUploadStoreLogoMutation,
} from "@/app/store/apis/SellerApi";
import Image from "next/image";

type TabType = "store" | "business" | "payment";

interface StoreInfoForm {
  storeName: string;
  description: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  slug: string;
}

const SellerSettings = () => {
  const [activeTab, setActiveTab] = useState<TabType>("store");
  const { showToast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data, isLoading, error } = useGetSellerProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateSellerProfileMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] =
    useUploadStoreLogoMutation();

  // Store Info Form
  const storeForm = useForm<StoreInfoForm>({
    defaultValues: {
      storeName: "",
      description: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      slug: "",
    },
  });

  // Load profile data into forms
  useEffect(() => {
    if (!data?.sellerProfile) return;

    const p = data.sellerProfile;

    storeForm.reset({
      storeName: p.storeName || "",
      description: p.storeDescription || "",
      phone: p.phone || "",
      address: (p as any).address || "",
      city: (p as any).city || "",
      state: (p as any).state || "",
      country: (p as any).country || "",
      zipCode: (p as any).zipCode || "",
      slug: "",
    });

    if (p.storeLogo) {
      setLogoPreview(p.storeLogo);
    }
  }, [data, storeForm]);


  // Generate slug from store name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Handle store name change to auto-generate slug
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    storeForm.setValue("storeName", name);
    if (name) {
      storeForm.setValue("slug", generateSlug(name));
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Logo file size must be less than 5MB", "error");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showToast("Please upload an image file", "error");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Handle store info save
  const handleStoreInfoSave = async (formData: StoreInfoForm) => {
    try {
      // Upload logo first if there's a new one
      if (logoFile) {
        const formDataLogo = new FormData();
        formDataLogo.append("logo", logoFile);
        await uploadLogo(formDataLogo).unwrap();
      }

      // Update profile
      await updateProfile({
        storeName: formData.storeName,
        storeDescription: formData.description,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
      }).unwrap();

      showToast("Store information updated successfully", "success");
      setLogoFile(null);
    } catch (err: any) {
      console.error("Failed to update store info:", err);
      showToast(
        err?.data?.message || "Failed to update store information",
        "error"
      );
    }
  };

  const tabs = [
    {
      id: "store" as TabType,
      label: "Store Information",
      icon: Store,
    },
    {
      id: "payment" as TabType,
      label: "Payment Settings",
      icon: CreditCard,
    },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <CustomLoader />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <div className="p-6"> 
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">
              Error loading seller profile. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    // <MainLayout>
    <div className="p-6"> 
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Seller Settings
          </h1>
          <p className="text-gray-600">
            Manage your store information and business details
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors relative ${
                    activeTab === tab.id
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Store Information Tab */}
          {activeTab === "store" && (
            <Card className="p-6">
              <form
                onSubmit={storeForm.handleSubmit(handleStoreInfoSave)}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Store Information
                  </h2>
                </div>

                {/* Store Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Logo
                  </label>
                  <div className="flex items-start gap-4">
                    {logoPreview && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={logoPreview}
                          alt="Store logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                      >
                        <Upload size={18} />
                        <span>Upload Logo</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Recommended: 400x400px, max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Store Name */}
                <Input
                  control={storeForm.control}
                  name="storeName"
                  label="Store Name"
                  placeholder="Enter your store name"
                  validation={{ required: "Store name is required" }}
                  error={storeForm.formState.errors.storeName?.message}
                  onChange={handleStoreNameChange}
                  icon={Store}
                />

                {/* Store Slug (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Slug
                  </label>
                  <div className="relative">
                    <Input
                      control={storeForm.control}
                      name="slug"
                      placeholder="store-slug"
                      // disabled={true}
                      icon={Globe}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-generated from store name. Used in your store URL.
                    </p>
                  </div>
                </div>

                {/* Store Description */}
                <TextArea
                  control={storeForm.control}
                  name="description"
                  label="Store Description"
                  placeholder="Describe your store..."
                  rows={4}
                  validation={{ required: "Store description is required" }}
                  error={storeForm.formState.errors.description?.message}
                />

                {/* Contact Phone */}
                <Input
                  control={storeForm.control}
                  name="phone"
                  label="Contact Phone"
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                  validation={{ required: "Phone number is required" }}
                  error={storeForm.formState.errors.phone?.message}
                  icon={Phone}
                />

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    control={storeForm.control}
                    name="address"
                    placeholder="123 Main St"
                    icon={MapPin}
                  />
                </div>

                {/* City, State, Country, Zip Code in grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Input
                      control={storeForm.control}
                      name="city"
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <Input
                      control={storeForm.control}
                      name="state"
                      placeholder="NY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <Input
                      control={storeForm.control}
                      name="country"
                      placeholder="United States"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code
                    </label>
                    <Input
                      control={storeForm.control}
                      name="zipCode"
                      placeholder="10001"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={isUpdating || isUploadingLogo}
                    className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed px-6 py-2.5 font-medium transition-colors"
                  >
                    <Save size={18} />
                    {isUpdating || isUploadingLogo
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Card>
          )}          

          {/* Payment Settings Tab */}
          {activeTab === "payment" && (
            <Card className="p-6">
              {/* TESTING: Stripe Connect disabled - START */}
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Payment Settings
                </h3>
                <p className="text-gray-600 mb-6">
                  Payment settings are coming soon. Stripe Connect integration
                  will be available in a future update.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Stripe Connect is currently disabled for testing
                    purposes.
                  </p>
                </div>
                {/* Placeholder for Stripe connection status */}
                {/* <div className="mt-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Stripe Account Status: Not Connected
                    </p>
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                    >
                      Connect Stripe Account
                    </button>
                  </div>
                </div> */}
              </div>
              {/* TESTING: Stripe Connect disabled - END */}
            </Card>
          )}
        </motion.div>
      </div>
    {/* </MainLayout> */}
    </div>
  );
};

export default SellerSettings;
