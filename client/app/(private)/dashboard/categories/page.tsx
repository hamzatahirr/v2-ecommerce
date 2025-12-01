"use client";
import React, { useState } from "react";
import {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/app/store/apis/CategoryApi";
import {
  useGetCommissionsQuery,
  useCreateCommissionMutation,
  useUpdateCommissionMutation,
  useDeleteCommissionMutation,
} from "@/app/store/apis/CommissionApi";
import Table from "@/app/components/layout/Table";
import { motion } from "framer-motion";
import { Tag, Trash2, Plus, Percent, Edit, Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import Modal from "@/app/components/organisms/Modal";
import ConfirmModal from "@/app/components/organisms/ConfirmModal";
import CategoryForm, { CategoryFormData } from "./CategoryForm";
import useToast from "@/app/hooks/ui/useToast";
import { withAuth } from "@/app/components/HOC/WithAuth";

const CategoriesDashboard = () => {
  const { showToast } = useToast();
  const { data, isLoading, error } = useGetAllCategoriesQuery({});
  const { data: commissionsData } = useGetCommissionsQuery({});
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();
  const [createCommission] = useCreateCommissionMutation();
  const [updateCommission] = useUpdateCommissionMutation();
  const [deleteCommission] = useDeleteCommissionMutation();
  const categories = data?.categories || [];
  const commissions = commissionsData?.commissions || [];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<any>(null);
  const [commissionForm, setCommissionForm] = useState({
    categoryId: "",
    rate: "",
    description: ""
  });

  const form = useForm<CategoryFormData>({
    defaultValues: { name: "", description: "", images: [] },
  });

  const getCommissionForCategory = (categoryId: string) => {
    return commissions.find(c => c.categoryId === categoryId);
  };

  const handleCreateCommission = async () => {
    try {
      await createCommission({
        categoryId: commissionForm.categoryId,
        rate: parseFloat(commissionForm.rate),
        description: commissionForm.description
      }).unwrap();
      
      showToast("Commission created successfully", "success");
      setIsCommissionModalOpen(false);
      setCommissionForm({ categoryId: "", rate: "", description: "" });
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to create commission", "error");
    }
  };

  const handleEditCommission = (category: any) => {
    const commission = getCommissionForCategory(category.id);
    if (commission) {
      setEditingCommission(commission);
      setCommissionForm({
        categoryId: commission.categoryId,
        rate: commission.rate.toString(),
        description: commission.description || ""
      });
    } else {
      setEditingCommission(null);
      setCommissionForm({
        categoryId: category.id,
        rate: "",
        description: ""
      });
    }
    setIsCommissionModalOpen(true);
  };

  const handleUpdateCommission = async () => {
    try {
      await updateCommission({
        categoryId: editingCommission.categoryId,
        rate: parseFloat(commissionForm.rate),
        description: commissionForm.description
      }).unwrap();
      
      showToast("Commission updated successfully", "success");
      setIsCommissionModalOpen(false);
      setEditingCommission(null);
      setCommissionForm({ categoryId: "", rate: "", description: "" });
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to update commission", "error");
    }
  };

  const handleDeleteCommission = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this commission?")) {
      return;
    }

    try {
      await deleteCommission(categoryId).unwrap();
      showToast("Commission deleted successfully", "success");
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to delete commission", "error");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-gray-800">{row?.name || "N/A"}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
      render: (row) => (
        <span className="text-gray-600">{row?.description || "No description"}</span>
      ),
    },
    {
      key: "commission",
      label: "Commission Rate",
      sortable: true,
      render: (row) => {
        const commission = getCommissionForCategory(row.id);
        return commission ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {commission.rate}%
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Not Set
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditCommission(row)}
            className="p-1 text-indigo-500 hover:text-indigo-600 transition-colors duration-200"
            aria-label="Manage commission"
            title="Manage Commission"
          >
            <Percent size={18} />
          </button>
          <button
            onClick={() => handleDeletePrompt(row?.id)}
            className="p-1 text-red-500 hover:text-red-600 transition-colors duration-200"
            aria-label="Delete category"
            disabled={isDeleting}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const handleDeletePrompt = (id: string) => {
    if (!id) return;
    setCategoryToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete).unwrap();
      setIsConfirmModalOpen(false);
      setCategoryToDelete(null);
      showToast("Category deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete category:", err);
      showToast("Failed to delete category", "error");
    }
  };

  const onSubmit = async (formData: CategoryFormData) => {
    const payload = new FormData();

    payload.append("name", formData.name || "");
    payload.append("description", formData.description || "");

    if (data.images && Array.isArray(data.images)) {
      data.images.forEach((file: any) => {
        if (file instanceof File) {
          payload.append("images", file);
        }
      });
    }

    console.log("FormData payload:");
    for (const [key, value] of payload.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    try {
      await createCategory(payload).unwrap();
      setIsCreateModalOpen(false);
      form.reset({ name: "" });
      showToast("Category created successfully", "success");
    } catch (err) {
      console.error("Failed to create category:", err);
      showToast("Failed to create category", "error");
    }
  };

  return (
    <div className="max-w-7xl min-w-full px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-3">
          <Tag size={24} className="text-indigo-500" />
          <h1 className="text-2xl font-bold text-gray-800">
            Categories & Commissions
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-300 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => setIsCommissionModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center space-x-2"
          >
            <Percent size={18} />
            <span>Manage Commissions</span>
          </button>
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <Tag size={48} className="mx-auto text-gray-400 mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Loading categories...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-lg text-red-500">
            Error loading categories:{" "}
            {(error as any)?.message || "Unknown error"}
          </p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <Tag size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg text-gray-600">No categories available</p>
        </div>
      ) : (
        <Table
          data={categories}
          columns={columns}
          isLoading={isLoading}
          className="bg-white rounded-xl shadow-md border border-gray-100"
        />
      )}

      {/* Create Category Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Create Category
        </h2>
        <CategoryForm
          form={form}
          onSubmit={onSubmit}
          isLoading={isCreating}
          submitLabel="Create"
        />
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        message="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmModalOpen(false)}
        title="Delete Category"
        type="danger"
      />

      {/* Commission Management Modal */}
      <Modal
        open={isCommissionModalOpen}
        onClose={() => {
          setIsCommissionModalOpen(false);
          setEditingCommission(null);
          setCommissionForm({ categoryId: "", rate: "", description: "" });
        }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <Percent className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-bold text-gray-800">
            {editingCommission ? 'Edit Commission' : 'Set Commission Rate'}
          </h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={commissionForm.categoryId}
              onChange={(e) => setCommissionForm({ ...commissionForm, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!!editingCommission}
            >
              <option value="">Select a category</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {editingCommission && (
              <p className="text-xs text-gray-500 mt-1">
                Category cannot be changed when editing
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commission Rate (%)
            </label>
            <input
              type="number"
              value={commissionForm.rate}
              onChange={(e) => setCommissionForm({ ...commissionForm, rate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter commission rate (e.g., 5 for 5%)"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={commissionForm.description}
              onChange={(e) => setCommissionForm({ ...commissionForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Optional description for this commission rate"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {editingCommission && (
            <button
              onClick={() => handleDeleteCommission(editingCommission.categoryId)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          )}
          <div className="flex-1 flex gap-3">
            <button
              onClick={() => {
                setIsCommissionModalOpen(false);
                setEditingCommission(null);
                setCommissionForm({ categoryId: "", rate: "", description: "" });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={editingCommission ? handleUpdateCommission : handleCreateCommission}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {editingCommission ? 'Update' : 'Set'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default withAuth(CategoriesDashboard);
