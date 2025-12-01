"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { TagsIcon } from "lucide-react";
import useToast from "@/app/hooks/ui/useToast";
import Dropdown from "@/app/components/molecules/Dropdown";
import { useGetAllCategoriesQuery } from "@/app/store/apis/CategoryApi";
import {
  useAssignAttributeToCategoryMutation,
} from "@/app/store/apis/AttributeApi";
import CategoryAssignmentSection from "./CategoryAssignment";

interface Attribute {
  id: string;
  name: string;
}

interface AssignFormData {
  attributeId: string;
  categoryId: string;
  isRequired: boolean;
}

interface AttributeAssignmentProps {
  attributes: Attribute[];
}

// Main component
const AttributeAssignment: React.FC<AttributeAssignmentProps> = ({
  attributes,
}) => {
  // Filter out duplicate attributes to prevent React key conflicts
  const uniqueAttributes = attributes.filter((attr, index, self) =>
    index === self.findIndex((a) => a.id === attr.id)
  );
  const { showToast } = useToast();
  const { control, handleSubmit, watch, setValue } = useForm<AssignFormData>({
    defaultValues: {
      attributeId: "",
      categoryId: "",
      isRequired: false,
    },
  });

  // API queries
  const { data: categoriesData } = useGetAllCategoriesQuery(undefined);

  // Mutations
  const [assignAttributeToCategory, { isLoading: isAssigningToCategory }] =
    useAssignAttributeToCategoryMutation();

  // Dropdown options
  const attributeOptions =
    uniqueAttributes?.map((attr) => ({
      label: attr.name,
      value: attr.id,
    })) || [];

  const categoryOptions =
    categoriesData?.categories?.map((cat: any) => ({
      label: cat.name,
      value: cat.id,
    })) || [];



  // Handle category assignment
  const onAssignToCategory = async (data: AssignFormData) => {
    if (!data.attributeId || !data.categoryId) {
      showToast("Please select an attribute and category", "error");
      return;
    }

    try {
      await assignAttributeToCategory({
        categoryId: data.categoryId,
        attributeId: data.attributeId,
        isRequired: data.isRequired,
      });
      showToast("Attribute assigned to category successfully", "success");
      setValue("categoryId", "");
      setValue("isRequired", false);
    } catch (err) {
      console.error("Error assigning to category:", err);
      showToast("Failed to assign attribute to category", "error");
    }
  };



  const handleAttributeChange = (value: string) => {
    setValue("attributeId", value);
    setValue("categoryId", "");
    setValue("isRequired", false);
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Assign Attributes
        </h2>
        <p className="text-sm text-gray-600">
          Select an attribute and assign it to categories
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

        {/* Assignment Sections */}
        {watch("attributeId") && (
          <div className="grid grid-cols-1 gap-6">
            <CategoryAssignmentSection
              control={control}
              handleSubmit={handleSubmit}
              onAssignToCategory={onAssignToCategory}
              categoryOptions={categoryOptions}
              isAssigningToCategory={isAssigningToCategory}
              watch={watch}
            />
          </div>
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

export default AttributeAssignment;
