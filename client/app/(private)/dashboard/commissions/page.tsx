"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Settings, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Globe, 
  CheckCircle, 
  XCircle,
  Percent
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useGetCommissionsQuery, useCreateCommissionMutation, useUpdateCommissionMutation, useDeleteCommissionMutation, useGetCommissionStatsQuery } from "@/app/store/apis/CommissionApi";
import useToast from "@/app/hooks/ui/useToast";
import { withAdminAuth } from "@/app/components/HOC/WithAuth";

function CommissionManagementPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCommission, setEditingCommission] = useState<any>(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    rate: "",
    description: ""
  });

  const { data: commissionsData, isLoading } = useGetCommissionsQuery({});
  const { data: statsData } = useGetCommissionStatsQuery({});
  const [createCommission] = useCreateCommissionMutation();
  const [updateCommission] = useUpdateCommissionMutation();
  const [deleteCommission] = useDeleteCommissionMutation();

  const handleCreateCommission = async () => {
    try {
      await createCommission({
        categoryId: formData.categoryId,
        rate: parseFloat(formData.rate),
        description: formData.description
      }).unwrap();
      
      showToast("Commission created successfully", "success");
      setShowCreateModal(false);
      setFormData({ categoryId: "", rate: "", description: "" });
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to create commission", "error");
    }
  };

  const handleEditCommission = (commission: any) => {
    setEditingCommission(commission);
    setFormData({
      categoryId: commission.categoryId,
      rate: commission.rate.toString(),
      description: commission.description || ""
    });
    setShowCreateModal(true);
  };

  const handleUpdateCommission = async () => {
    try {
      await updateCommission({
        categoryId: editingCommission.categoryId,
        rate: parseFloat(formData.rate),
        description: formData.description
      }).unwrap();
      
      showToast("Commission updated successfully", "success");
      setShowCreateModal(false);
      setEditingCommission(null);
      setFormData({ categoryId: "", rate: "", description: "" });
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

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 min-w-full bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Commission Management</h1>
          <p className="text-gray-600">Set and manage commission rates for product categories</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Total Commissions</h3>
                <Percent className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{statsData?.totalCommissions || 0}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Average Rate</h3>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(statsData?.averageRate || 0)}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Categories with Commission</h3>
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{statsData?.categoriesWithCommission || 0}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Categories without Commission</h3>
                <XCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{statsData?.categoriesWithoutCommission || 0}</p>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Commission Rates</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Commission
          </button>
        </div>

        {/* Commissions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="overflow-x-auto">
            {commissionsData?.commissions && commissionsData.commissions.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissionsData.commissions.map((commission, index) => (
                    <tr key={commission.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          {commission.category?.name || 'Unknown Category'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {formatPercentage(commission.rate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {commission.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCommission(commission)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCommission(commission.categoryId)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Percent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No commissions set yet</p>
                <p className="text-sm text-gray-500">Add your first commission rate to get started</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCommission ? 'Edit Commission' : 'Create Commission'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category ID
                </label>
                <input
                  type="text"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter category ID"
                  disabled={!!editingCommission}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingCommission ? 'Category ID cannot be changed' : 'Enter unique category identifier'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
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
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Optional description for this commission rate"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingCommission ? handleUpdateCommission : handleCreateCommission}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingCommission ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default withAdminAuth(CommissionManagementPage);