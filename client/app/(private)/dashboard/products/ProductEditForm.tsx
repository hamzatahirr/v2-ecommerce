"use client";
import { motion } from "framer-motion";
import { UseFormReturn, useWatch } from "react-hook-form";
import ProductForm from "./ProductForm";
import { ProductFormData } from "./product.types";
import { useGetAttributesByCategoryQuery } from "@/app/store/apis/AttributeApi";

interface ProductEditFormProps {
  form: UseFormReturn<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  categories: { label: string; value: string }[];
  isUpdating: boolean;
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({
  form,
  onSubmit,
  categories,
  isUpdating,
}) => {
  const categoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });

  // Fetch category-specific attributes when category is selected
  const { data: categoryAttributesData, isLoading: attributesLoading } = 
    useGetAttributesByCategoryQuery(categoryId, {
      skip: !categoryId,
    });

  // Transform attributes data for the form
  const categoryAttributes = categoryAttributesData?.attributes?.map(attr => ({
    id: attr.id,
    name: attr.name,
    isRequired: attr.categories?.[0]?.isRequired || false,
    values: attr.values || [],
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100"
    >
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Edit Product</h2>
      </div>

      <div className="p-6">
        <ProductForm
          form={form}
          onSubmit={onSubmit}
          categories={categories}
          categoryAttributes={categoryAttributes}
          isLoading={isUpdating}
          submitLabel={isUpdating ? "Saving..." : "Save Changes"}
        />
      </div>
    </motion.div>
  );
};

export default ProductEditForm;
