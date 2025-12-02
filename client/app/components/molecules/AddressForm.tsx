"use client";

import { useForm, Controller } from "react-hook-form";
import { MapPin, Globe, Building, Mail } from "lucide-react";
import { motion } from "framer-motion";

export interface AddressFormData {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<AddressFormData>;
}

const AddressForm: React.FC<AddressFormProps> = ({
  onSubmit,
  isLoading = false,
  defaultValues = {},
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    defaultValues: {
      street: "",
      city: "",
      state: "",
      country: "",
      zip: "",
      ...defaultValues,
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200"
    >
      <div className="flex items-center space-x-2 mb-6">
        <MapPin size={20} className="text-indigo-600" />
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Shipping Address
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Street Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address
          </label>
          <Controller
            name="street"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  {...field}
                  type="text"
                  placeholder="123 Main Street, Apt 4B"
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.street
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  disabled={isLoading}
                />
              </div>
            )}
          />
          {errors.street && (
            <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
          )}
        </div>

        {/* City and State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Building
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    {...field}
                    type="text"
                    placeholder="New York"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.city
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                </div>
              )}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State/Province
            </label>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Building
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    {...field}
                    type="text"
                    placeholder="NY"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.state
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                </div>
              )}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>
        </div>

        {/* Country and ZIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Globe
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    {...field}
                    type="text"
                    placeholder="United States"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.country
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                </div>
              )}
            />
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP/Postal Code
            </label>
            <Controller
              name="zip"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    {...field}
                    type="text"
                    placeholder="10001"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.zip
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                </div>
              )}
            />
            {errors.zip && (
              <p className="mt-1 text-sm text-red-600">{errors.zip.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-medium text-sm hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Continue to Payment"}
        </button>
      </form>
    </motion.div>
  );
};

export default AddressForm;