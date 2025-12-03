"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Globe, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Shield,
  AlertTriangle
} from "lucide-react";

import { 
  useGetAllowedDomainsQuery, 
  useCreateDomainMutation, 
  useUpdateDomainMutation, 
  useDeleteDomainMutation,
  useToggleDomainStatusMutation 
} from "@/app/store/apis/AllowedDomainsApi";
import useToast from "@/app/hooks/ui/useToast";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function AllowedDomainsPage() {
  const { showToast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<any>(null);
  const [formData, setFormData] = useState({
    domain: ""
  });

  const { data: domainsData, isLoading } = useGetAllowedDomainsQuery({});
  const [createDomain] = useCreateDomainMutation();
  const [updateDomain] = useUpdateDomainMutation();
  const [deleteDomain] = useDeleteDomainMutation();
  const [toggleDomainStatus] = useToggleDomainStatusMutation();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const handleCreateDomain = async () => {
    try {
      await createDomain({
        domain: formData.domain.trim()
      }).unwrap();
      
      showToast("Domain added successfully", "success");
      setShowCreateModal(false);
      setFormData({ domain: "" });
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to add domain", "error");
    }
  };

  const handleEditDomain = (domain: any) => {
    setEditingDomain(domain);
    setFormData({
      domain: domain.domain
    });
    setShowCreateModal(true);
  };

  const handleUpdateDomain = async () => {
    try {
      await updateDomain({
        id: editingDomain.id,
        domain: formData.domain.trim()
      }).unwrap();
      
      showToast("Domain updated successfully", "success");
      setShowCreateModal(false);
      setEditingDomain(null);
      setFormData({ domain: "" });
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to update domain", "error");
    }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!confirm("Are you sure you want to delete this domain? This will affect user registration.")) {
      return;
    }

    try {
      await deleteDomain(id).unwrap();
      showToast("Domain deleted successfully", "success");
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to delete domain", "error");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleDomainStatus(id).unwrap();
      showToast("Domain status updated successfully", "success");
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to update domain status", "error");
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Allowed Domains</h1>
          <p className="text-gray-600">Manage domains that are allowed for user registration</p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">Registration Control</h3>
              <p className="text-sm text-blue-700">
                Only users with email addresses from these domains can register. This helps prevent spam and unauthorized registrations.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Domain List</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Domain
          </button>
        </div>

        {/* Domains Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="overflow-x-auto">
            {domainsData?.domains && domainsData.domains.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                  {domainsData.domains.map((domain, index) => (
                    <tr key={domain.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{domain.domain}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          domain.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {domain.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(domain.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(domain.id)}
                            className={`p-1 rounded hover:bg-gray-100 ${
                              domain.isActive 
                                ? 'text-yellow-600 hover:text-yellow-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={domain.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {domain.isActive ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditDomain(domain)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium p-1 rounded hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDomain(domain.id)}
                            className="text-red-600 hover:text-red-900 font-medium p-1 rounded hover:bg-gray-100"
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
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No allowed domains configured</p>
                <p className="text-sm text-gray-500">Add your first domain to restrict registration</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Security Notice</h3>
              <p className="text-sm text-yellow-700">
                When no domains are configured, all email domains are allowed for registration. 
                Configure at least one domain to enable restrictions.
              </p>
            </div>
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
              {editingDomain ? 'Edit Domain' : 'Add Domain'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter domain name without protocol (e.g., example.com)
                </p>
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
                onClick={editingDomain ? handleUpdateDomain : handleCreateDomain}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingDomain ? 'Update' : 'Add'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AllowedDomainsPage;