import Dropdown from "@/app/components/molecules/Dropdown";
import { Box, Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";

const ProductAssignmentSection: React.FC<{
  control: any;
  handleSubmit: any;
  onAssignToProduct: any;
  productOptions: any[];
  isAssigningToProduct: boolean;
  watch: any;
  isLoadingProducts?: boolean;
  attributeValueOptions?: any[];
  onProductChange?: (value: string) => void;
}> = ({
  control,
  handleSubmit,
  onAssignToProduct,
  productOptions,
  isAssigningToProduct,
  watch,
  isLoadingProducts = false,
  attributeValueOptions = [],
  onProductChange,
}) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-4">
      <Box size={18} className="text-green-600" />
      <h3 className="text-base font-semibold text-gray-800">
        Assign to Product
      </h3>
    </div>

    {isLoadingProducts ? (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-gray-400" size={24} />
        <span className="ml-2 text-gray-500">Loading your products...</span>
      </div>
    ) : (
      <form onSubmit={handleSubmit(onAssignToProduct)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Product
          </label>
          <Controller
            name="productId"
            control={control}
            render={({ field }) => (
              <Dropdown
                options={productOptions}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  onProductChange?.(value);
                }}
                label="Choose a product"
              />
            )}
          />
        </div>

        {watch("productId") && attributeValueOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Attribute Value
            </label>
            <Controller
              name="valueId"
              control={control}
              render={({ field }) => (
                <Dropdown
                  options={attributeValueOptions}
                  value={field.value}
                  onChange={field.onChange}
                  label="Choose a value"
                />
              )}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={
            isAssigningToProduct || 
            !watch("attributeId") || 
            !watch("productId") ||
            (attributeValueOptions.length > 0 && !watch("valueId"))
          }
          className="w-full px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
        >
          {isAssigningToProduct ? "Assigning..." : "Assign to Product"}
        </button>
      </form>
    )}
  </div>
);

export default ProductAssignmentSection;