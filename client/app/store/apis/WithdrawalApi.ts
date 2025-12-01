import { apiSlice } from "../slices/ApiSlice";

export const withdrawalApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    requestWithdrawal: builder.mutation({
      query: (data) => ({
        url: "/withdrawals/request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Withdrawal"],
    }),
    
    getSellerWithdrawals: builder.query({
      query: ({ page = 1, limit = 20 }) => ({
        url: "/withdrawals/my-withdrawals",
        params: { page, limit },
      }),
      providesTags: ["Withdrawal"],
    }),
    
    getSellerWithdrawalStats: builder.query({
      query: () => ({
        url: "/withdrawals/my-withdrawals/stats",
      }),
      providesTags: ["Withdrawal"],
    }),
    
    getWithdrawalDetails: builder.query({
      query: (withdrawalId) => ({
        url: `/withdrawals/${withdrawalId}`,
      }),
      providesTags: ["Withdrawal"],
    }),
  }),
});

export const {
  useRequestWithdrawalMutation,
  useGetSellerWithdrawalsQuery,
  useGetSellerWithdrawalStatsQuery,
  useGetWithdrawalDetailsQuery,
} = withdrawalApi;