"use client";
import Table from "@/app/components/layout/Table";
import {
  useDeleteSellerProductMutation,
  useGetSellerProductsQuery,
  useUpdateSellerProductMutation,
} from "@/app/store/apis/ProductApi";
import { useState } from "react";
import ProductModal from "@/app/(private)/dashboard/products/ProductModal";
import { Trash2, Edit, Upload, X, Plus } from "lucide-react";
import ConfirmModal from "@/app/components/organisms/ConfirmModal";
import useToast from "@/app/hooks/ui/useToast";
import ProductFileUpload from "@/app/(private)/dashboard/products/ProductFileUpload";
import { usePathname, useRouter } from "next/navigation";
import { ProductFormData } from "@/app/(private)/dashboard/products/product.types";
import { withSellerAuth } from "@/app/components/HOC/WithSellerAuth";

const SellerProductsDashboard = () => {
  const { showToast } = useToast();
  const router = useRouter();
  const [updateProduct, { isLoading: isUpdating, error: updateError }] =
    useUpdateSellerProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteSellerProductMutation();

  const pathname = usePathname();
  const shouldFetchProducts = pathname === "/seller/products";

  const { data, isLoading } = useGetSellerProductsQuery(
    { select: { variants: true } },
    { skip: !shouldFetchProducts }
  );
  const products = data?.products || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(
    null
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;

    const payload = new FormData();
    payload.append("name", data.name || "");
    payload.append("description", data.description || "");
    payload.append("isNew", data.isNew.toString());
    payload.append("isTrending", data.isTrending.toString());
    payload.append("isBestSeller", data.isBestSeller.toString());
    payload.append("isFeatured", data.isFeatured.toString());
    payload.append("categoryId", data.categoryId || "");
    payload.append("variants", JSON.stringify(data.variants));

    try {
      await updateProduct({
        id: editingProduct.id!,
        data: payload,
      }).unwrap();
      setIsModalOpen(false);
      setEditingProduct(null);
      showToast("Product updated successfully", "success");
    } catch (err) {
      console.error("Failed to update product:", err);
      showToast("Failed to update product", "error");
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete).unwrap();
      setIsConfirmModalOpen(false);
      setProductToDelete(null);
      showToast("Product deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete product:", err);
      showToast("Failed to delete product", "error");
    }
  };

  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
    setProductToDelete(null);
  };

  const handleFileUploadSuccess = () => {
    setIsFileUploadOpen(false);
    showToast("Products uploaded successfully", "success");
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (row: any) => (
        <div className="flex items-center space-x-2">
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      key: "variants",
      label: "Variants",
      sortable: false,
      render: (row: any) => (
        <div>
          {row.variants?.length > 0 ? (
            row.variants.map((v: any) => (
              <span
                key={v.id}
                className="inline-block mr-2 bg-gray-100 px-2 py-1 rounded"
              >
                {v.sku}
              </span>
            ))
          ) : (
            <span className="text-gray-500">No variants</span>
          )}
        </div>
      ),
    },
    {
      key: "salesCount",
      label: "Sales Count",
      sortable: true,
      render: (row: any) => row.salesCount || 0,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/seller/products/${row.id}`)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={() => handleDeleteProduct(row.id)}
            className="text-red-600 hover:text-red-800 flex items-center gap-1"
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            {isDeleting && productToDelete === row.id
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold">My Products</h1>
          <p className="text-sm text-gray-500">Manage and view your products</p>
        </div>
        <div className="flex space-x-3">
          
          <button
            onClick={() => router.push("/seller/products/create")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Product
          </button>
        </div>
      </div>

      {isFileUploadOpen && (
        <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Import Products</h2>
            <button
              onClick={() => setIsFileUploadOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <ProductFileUpload onUploadSuccess={handleFileUploadSuccess} />
        </div>
      )}

      <Table
        data={products}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No products available. Create your first product!"
        onRefresh={() => console.log("refreshed")}
        totalPages={data?.totalPages}
        totalResults={data?.totalResults}
        resultsPerPage={data?.resultsPerPage}
        currentPage={data?.currentPage}
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleUpdateProduct}
        initialData={editingProduct || undefined}
        isLoading={isUpdating}
        error={updateError}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default withSellerAuth(SellerProductsDashboard);
