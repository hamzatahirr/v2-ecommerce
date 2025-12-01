"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { TagsIcon, Box } from "lucide-react";
import useToast from "@/app/hooks/ui/useToast";
import Dropdown from "@/app/components/molecules/Dropdown";
import { useGetSellerProductsQuery, useGetSellerProductVariantsQuery } from "@/app/store/apis/ProductApi";
import {
  useAssignAttributeToProductMutation,
} from "@/app/store/apis/AttributeApi";
import ProductAssignmentSection from "./ProductAssignmentSection";

interface Attribute {
  id: string;
  name: string;
}

interface AssignFormData {
  attributeId: string;
  productId: string;
  valueId?: string;
}

interface ProductAttributeAssignmentProps {
  attributes: Attribute[];
}

const ProductAttributeAssignment: React.FC<ProductAttributeAssignmentProps> = ({
  attributes,
}) => {
  const uniqueAttributes = attributes.filter((attr, index, self) =>
    index === self.findIndex((a) => a.id === attr.id)
  );
  const { showToast } = useToast();
  const { control, handleSubmit, watch, setValue } = useForm<AssignFormData>({
    defaultValues: {
      attributeId: "",
      productId: "",
      valueId: "",
    },
  });

  // API queries
  const { data: productsData, isLoading: isLoadingProducts } = useGetSellerProductsQuery(undefined);
  const selectedProductId = watch("productId");
  const { data: variantsData, isLoading: isLoadingVariants } = useGetSellerProductVariantsQuery(
    selectedProductId,
    { skip: !selectedProductId }
  );

  // Mutations
  const [assignAttributeToProduct, { isLoading: isAssigningToProduct }] =
    useAssignAttributeToProductMutation();

  // Dropdown options
  const attributeOptions =
    uniqueAttributes?.map((attr) => ({
      label: attr.name,
      value: attr.id,
    })) || [];

  const productOptions =
    productsData?.products?.map((prod: any) => ({
      label: prod.name,
      value: prod.id,
    })) || [];

  // Get attribute values for the selected attribute
  const selectedAttribute = uniqueAttributes.find(attr => attr.id === watch("attributeId"));
  const attributeValueOptions = selectedAttribute?.values?.map((value: any) => ({
    label: value.value,
    value: value.id,
  })) || [];

  // Handle product assignment
  const onAssignToProduct = async (data: AssignFormData) => {
    if (!data.attributeId || !data.productId) {
      showToast("Please select an attribute and product", "error");
      return;
    }

    try {
      await assignAttributeToProduct({
        attributeId: data.attributeId,
        productId: data.productId,
        valueId: data.valueId,
      });
      showToast("Attribute assigned to product successfully", "success");
      setValue("productId", "");
      setValue("valueId", "");
    } catch (err) {
      console.error("Error assigning to product:", err);
      showToast("Failed to assign attribute to product", "error");
    }
  };

  const handleAttributeChange = (value: string) => {
    setValue("attributeId", value);
    setValue("productId", "");
    setValue("valueId", "");
  };

  const handleProductChange = (value: string) => {
    setValue("productId", value);
    setValue("valueId", "");
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Assign Attributes to Products
        </h2>
        <p className="text-sm text-gray-600">
          Select an attribute and assign it to your product variants
        </p>
      </div>

      <div className="space-y-6">
        {/* Attribute Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Attribute
          </label>
          <Controller
            name="attributeId"
            control={control}
            render={({ field }) => (
              <Dropdown
                options={attributeOptions}
                value={field.value}
                onChange={handleAttributeChange}
                label="Choose an attribute"
              />
            )}
          />
        </div>

        {/* Assignment Section */}
        {watch("attributeId") && (
          <ProductAssignmentSection
            control={control}
            handleSubmit={handleSubmit}
            onAssignToProduct={onAssignToProduct}
            productOptions={productOptions}
            isAssigningToProduct={isAssigningToProduct}
            watch={watch}
            isLoadingProducts={isLoadingProducts}
            attributeValueOptions={attributeValueOptions}
            onProductChange={handleProductChange}
          />
        )}

        {!watch("attributeId") && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <TagsIcon size={32} className="mx-auto" />
            </div>
            <p className="text-sm text-gray-500">
              Select an attribute to begin assignment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductAttributeAssignment;