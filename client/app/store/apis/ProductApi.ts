import { apiSlice } from "../slices/ApiSlice";

export const productApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Admin/General endpoints
    getAllProducts: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams();
        
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryString.set(key, String(value));
            }
          });
        }

        return {
          url: `/admin/products?${queryString.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Product"],
    }),

    getProductById: builder.query({
      query: (id) => `/admin/products/${id}`,
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation({
      query: (productData) => ({
        url: "/admin/products",
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    bulkProducts: builder.mutation({
      query: (formData) => ({
        url: "/admin/products/bulk",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),

    getProductBySlug: builder.query({
      query: (slug) => `/products/slug/${slug}`,
      providesTags: ["Product"],
    }),

    // Seller-specific endpoints
    getSellerProducts: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams();

        if (params) {
          const {
            searchQuery,
            sort,
            limit,
            category,
            page,
            featured,
            bestselling,
          } = params;

          if (searchQuery) queryString.set("searchQuery", searchQuery);
          if (sort) queryString.set("sort", sort);
          if (limit) queryString.set("limit", limit);
          if (category) queryString.set("category", category);
          if (page) queryString.set("page", page);
          if (featured) queryString.set("featured", "true");
          if (bestselling) queryString.set("bestselling", "true");
        }

        return {
          url: `/products?${queryString.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Product", "Seller"],
    }),

    getSellerProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: ["Product", "Seller"],
    }),

    createSellerProduct: builder.mutation({
      query: (productData) => ({
        url: "/products",
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Product", "Seller"],
    }),

    updateSellerProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product", "Seller"],
    }),

    deleteSellerProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product", "Seller"],
    }),

    getSellerProductVariants: builder.query({
      query: (productId) => `/products/${productId}/variants`,
      providesTags: ["Product", "Seller"],
    }),
  }),
});

export const {
  useBulkProductsMutation,
  useGetAllProductsQuery,
  useGetProductBySlugQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetSellerProductsQuery,
  useGetSellerProductByIdQuery,
  useCreateSellerProductMutation,
  useUpdateSellerProductMutation,
  useDeleteSellerProductMutation,
  useGetSellerProductVariantsQuery,
} = productApi;
