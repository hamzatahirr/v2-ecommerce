"use client";

import React, { useState } from "react";
import { Plus, AlertCircle, Tag } from "lucide-react";
import useToast from "@/app/hooks/ui/useToast";
import { useCreateAttributeMutation } from "@/app/store/apis/AttributeApi";

const AttributeForm: React.FC = () => {
  const { showToast } = useToast();
  const [createAttribute, { isLoading: isCreatingAttribute }] =
    useCreateAttributeMutation();

  const [newAttribute, setNewAttribute] = useState({
    name: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateAttribute = (name: string): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) {
      errors.name = "Attribute name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Attribute name must be at least 2 characters";
    } else if (name.trim().length > 50) {
      errors.name = "Attribute name must be less than 50 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      errors.name = "Attribute name should only contain letters and spaces";
    }
    
    return errors;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewAttribute({ name });
    
    // Clear validation errors as user types
    if (validationErrors.name) {
      setValidationErrors(validateAttribute(name));
    }
  };

  const handleCreateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submission
    const errors = validateAttribute(newAttribute.name);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      showToast("Please fix the validation errors", "error");
      return;
    }

    try {
      await createAttribute({
        name: newAttribute.name.trim(),
      });
      showToast("Attribute created successfully", "success");
      setNewAttribute({ name: "" });
      setValidationErrors({});
    } catch (err: any) {
      console.error("Error creating attribute:", err);
      const errorMessage = err.data?.message || "Failed to create attribute";
      showToast(errorMessage, "error");
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="text-blue-600" size={20} />
        <h2 className="text-lg font-semibold text-gray-800">
          Create New Attribute
        </h2>
      </div>
      
      <form onSubmit={handleCreateAttribute} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attribute Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newAttribute.name}
            onChange={handleNameChange}
            placeholder="e.g., Color, Size, Material"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              validationErrors.name
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-200"
            }`}
            required
            disabled={isCreatingAttribute}
          />
          
          {validationErrors.name && (
            <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
              <AlertCircle size={12} />
              <span>{validationErrors.name}</span>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <strong>Tip:</strong> Attributes are global characteristics that sellers can use for their products (e.g., Color, Size, Material).
          </p>
        </div>

        <button
          type="submit"
          disabled={isCreatingAttribute || !newAttribute.name.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          {isCreatingAttribute ? "Creating..." : "Create Attribute"}
        </button>
      </form>
    </div>
  );
};

export default AttributeForm;
