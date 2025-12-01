import { apiSlice } from "../slices/ApiSlice";

export const variantApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all variants with pagination and filtering
    getAllVariants: builder.query({
      query: (params = {}) => ({
        url: '/variants',
        params,
      }),
      providesTags: ['Variant'],
    }),

    // Get single variant by ID
    getVariant: builder.query({
      query: (id: string) => `/variants/${id}`,
      providesTags: (result, error, id) => [{ type: 'Variant', id }],
    }),

    // Restock variant
    restockVariant: builder.mutation({
      query: ({ id, data }) => ({
        url: `/variants/${id}/restock`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Variant', id }],
    }),

    // Get variant restock history
    getVariantRestockHistory: builder.query({
      query: (variantId: string) => `/variants/${variantId}/restock-history`,
      providesTags: ['RestockHistory'],
    }),
  }),
});

export const {
  useGetAllVariantsQuery,
  useGetVariantQuery,
  useRestockVariantMutation,
  useGetVariantRestockHistoryQuery,
} = variantApi;