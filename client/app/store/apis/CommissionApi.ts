import { apiSlice } from "../slices/ApiSlice";

export const commissionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCommissions: builder.query({
      query: ({ page = 1, limit = 20 }) => ({
        url: "/commissions",
        params: { page, limit },
      }),
      providesTags: ["Commission"],
    }),
    
    getCommissionStats: builder.query({
      query: () => ({
        url: "/commissions/stats",
      }),
      providesTags: ["Commission"],
    }),
    
    createCommission: builder.mutation({
      query: (data) => ({
        url: "/commissions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Commission"],
    }),
    
    updateCommission: builder.mutation({
      query: ({ categoryId, ...data }) => ({
        url: `/commissions/category/${categoryId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Commission"],
    }),
    
    deleteCommission: builder.mutation({
      query: (categoryId) => ({
        url: `/commissions/category/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Commission"],
    }),
  }),
});

export const {
  useGetCommissionsQuery,
  useGetCommissionStatsQuery,
  useCreateCommissionMutation,
  useUpdateCommissionMutation,
  useDeleteCommissionMutation,
} = commissionApi;