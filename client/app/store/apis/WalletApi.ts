import { apiSlice } from "../slices/ApiSlice";

export const walletApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWalletBalance: builder.query({
      query: () => ({
        url: "/wallet/my-wallet/balance",
      }),
      providesTags: ["Wallet"],
    }),
    
    getWalletTransactions: builder.query({
      query: ({ page = 1, limit = 20 }) => ({
        url: "/wallet/my-wallet/transactions",
        params: { page, limit },
      }),
      providesTags: ["Wallet"],
    }),
    
    getSellerWallet: builder.query({
      query: () => ({
        url: "/wallet/my-wallet",
      }),
      providesTags: ["Wallet"],
    }),
  }),
});

export const {
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useGetSellerWalletQuery,
} = walletApi;