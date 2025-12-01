"use client";
import { ArrowLeft, AlertCircle, XCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";
import ProductHeader from "@/app/(private)/dashboard/products/ProductHeader";
import ProductSummary from "@/app/(private)/dashboard/products/ProductSummary";
import ProductEditForm from "@/app/(private)/dashboard/products/ProductEditForm";
import ConfirmModal from "@/app/components/organisms/ConfirmModal";
import { useSellerProductDetails } from "@/app/hooks/miscellaneous/useSellerProductDetails";
import CustomLoader from "@/app/components/feedback/CustomLoader";
import { withSellerAuth } from "@/app/components/HOC/WithSellerAuth";
// import { useAuth } from "@/app/hooks/useAuth";

const SellerManageProduct = () => {
  const {
    product,
    totalStock,
    categories,
    productsLoading,
    categoriesLoading,
    productsError,
    form,
    isUpdating,
    isDeleting,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    onSubmit,
    handleDelete,
    router,
    selectedVariant,
    handleVariantChange,
    resetSelections,
    attributeGroups,
    selectedAttributes,
    isOwner,
  } = useSellerProductDetails();

  if (productsLoading || categoriesLoading) {
    return <CustomLoader />;
  }

  if (productsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <XCircle size={48} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Product
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t retrieve the product information. Please try again
            later.
          </p>
          <button
            onClick={() => router.push("/seller/products")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">The product could not be found.</p>
          <button
            onClick={() => router.push("/seller/products")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Products
          </button>
        </div>
      </div>
    );
  }

  // Check ownership
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <Shield size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to edit this product. This product
            belongs to another seller.
          </p>
          <button
            onClick={() => router.push("/seller/products")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => router.push("/seller/products")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Products</span>
          </button>
        </motion.div>

        <ProductHeader
          product={product}
          stock={totalStock}
          isDeleting={isDeleting}
          onDelete={() => setIsConfirmModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProductSummary
              product={product}
              categories={categories}
              stock={totalStock} 
              // selectedVariant={selectedVariant}
              // attributeGroups={attributeGroups}
              // selectedAttributes={selectedAttributes}
              // onVariantChange={handleVariantChange}
              // resetSelections={resetSelections}
              isUpdating={isUpdating}
              onSave={() => form.handleSubmit(onSubmit)()}
            />
          </div>

          <div className="lg:col-span-2">
            <ProductEditForm
              form={form}
              onSubmit={onSubmit}
              categories={categories}
              isUpdating={isUpdating}
            />
          </div>
        </div>

        <ConfirmModal
          isOpen={isConfirmModalOpen}
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default withSellerAuth(SellerManageProduct);

