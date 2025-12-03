"use client";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  useGetAllCategoriesQuery,
  useGetCategoryAttributesQuery,
} from "@/app/store/apis/CategoryApi";
import { useCreateSellerProductMutation } from "@/app/store/apis/ProductApi";
import { ProductFormData } from "@/app/(private)/dashboard/products/product.types";
import ProductForm from "@/app/(private)/dashboard/products/ProductForm";
import useToast from "@/app/hooks/ui/useToast";
import CustomLoader from "@/app/components/feedback/CustomLoader";

const SellerCreateProduct = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [createProduct, { isLoading: isCreating, error: createError }] =
    useCreateSellerProductMutation();

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAllCategoriesQuery({});

  const categories =
    categoriesData?.categories?.map((category) => ({
      label: category.name,
      value: category.id,
    })) || [];

  const form = useForm<ProductFormData>({
    defaultValues: {
      id: "",
      name: "",
      isNew: false,
      isTrending: false,
      isFeatured: false,
      isBestSeller: false,
      categoryId: "",
      description: "",
      variants: [
        {
          id: "",
          images: [],
          lowStockThreshold: 10,
          barcode: "",
          warehouseLocation: "",
          price: 0,
          sku: "",
          stock: 0,
          attributes: [],
        },
      ],
    },
  });

  const selectedCategoryId = form.watch("categoryId");
  const { data: categoryAttributesData } = useGetCategoryAttributesQuery(
    selectedCategoryId,
    {
      skip: !selectedCategoryId,
    }
  );
  const categoryAttributes = categoryAttributesData?.attributes || [];

  const handleCreateProduct = async (data: ProductFormData) => {
    const payload = new FormData();
    payload.append("name", data.name || "");
    payload.append("description", data.description || "");
    payload.append("isNew", data.isNew.toString());
    payload.append("isTrending", data.isTrending.toString());
    payload.append("isBestSeller", data.isBestSeller.toString());
    payload.append("isFeatured", data.isFeatured.toString());
    payload.append("categoryId", data.categoryId || "");

    // Track image indexes for each variant
    let imageIndex = 0;
    data.variants.forEach((variant, index) => {
      payload.append(`variants[${index}][sku]`, variant.sku || "");
      payload.append(`variants[${index}][price]`, variant.price.toString());
      payload.append(`variants[${index}][stock]`, variant.stock.toString());
      payload.append(
        `variants[${index}][lowStockThreshold]`,
        variant.lowStockThreshold?.toString() || "10"
      );
      payload.append(`variants[${index}][barcode]`, variant.barcode || "");
      payload.append(
        `variants[${index}][warehouseLocation]`,
        variant.warehouseLocation || ""
      );
      // Append attributes as JSON
      payload.append(
        `variants[${index}][attributes]`,
        JSON.stringify(variant.attributes || [])
      );
      // Track image indexes for this variant
      if (Array.isArray(variant.images) && variant.images.length > 0) {
        const imageIndexes = variant.images
          .map((file) => {
            if (file instanceof File) {
              payload.append(`images`, file);
              return imageIndex++;
            }
            return null;
          })
          .filter((idx) => idx !== null);
        payload.append(
          `variants[${index}][imageIndexes]`,
          JSON.stringify(imageIndexes)
        );
      } else {
        payload.append(`variants[${index}][imageIndexes]`, JSON.stringify([]));
      }
    });

    try {
      const result = await createProduct(payload).unwrap();
      showToast("Product created successfully", "success");
      // Redirect to the product detail page
      if (result?.product?.id) {
        router.push(`/seller/products/${result.product.id}`);
      } else {
        router.push("/seller/products");
      }
    } catch (err: any) {
      console.error("Failed to create product:", err);
      showToast(
        err?.data?.message || "Failed to create product",
        "error"
      );
    }
  };

  if (categoriesLoading) {
    return <CustomLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-800">Create New Product</h1>
            <p className="text-sm text-gray-500 mt-1">
              Add a new product to your store
            </p>
          </div>

          <ProductForm
            form={form}
            onSubmit={handleCreateProduct}
            categories={categories}
            categoryAttributes={categoryAttributes}
            isLoading={isCreating}
            error={createError}
            submitLabel={isCreating ? "Creating..." : "Create Product"}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default SellerCreateProduct;

