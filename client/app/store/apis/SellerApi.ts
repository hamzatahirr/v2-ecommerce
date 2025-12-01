import { apiSlice } from "../slices/ApiSlice";

// Seller Analytics Response Types
interface SellerAnalyticsResponse {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  revenueChange?: number;
  ordersChange?: number;
  productsChange?: number;
  monthlyTrends?: {
    revenue: number[];
    labels: string[];
  };
  topProducts?: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    category?: string;
    imageUrl?: string;
  }>;
}

// Seller Orders Response
interface SellerOrdersResponse {
  orders: Array<{
    id: string;
    orderId: string;
    status: string;
    total: number;
    orderDate: string;
    customerName?: string;
    customerEmail?: string;
  }>;
  totalPages?: number;
  totalResults?: number;
  resultsPerPage?: number;
  currentPage?: number;
}

// Seller Products Response
interface SellerProductsResponse {
  products: Array<{
    id: string;
    name: string;
    salesCount: number;
    revenue: number;
  }>;
  totalPages?: number;
  totalResults?: number;
  resultsPerPage?: number;
  currentPage?: number;
}

// Seller Profile Update Request
interface UpdateSellerProfileRequest {
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  storeBanner?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export const sellerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get seller analytics/overview
    getSellerAnalytics: builder.query<SellerAnalyticsResponse, { timePeriod?: string }>({
      query: (params) => {
        const queryString = new URLSearchParams();
        if (params?.timePeriod) {
          queryString.set("timePeriod", params.timePeriod);
        }
        return {
          url: `/sellers/analytics/dashboard?${queryString.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Seller", "Order", "Product", "Transactions"],
    }),

    // Get seller orders
    getSellerOrders: builder.query<SellerOrdersResponse, { page?: number; limit?: number; status?: string }>({
      query: (params) => {
        const queryString = new URLSearchParams();
        if (params?.page) queryString.set("page", params.page.toString());
        if (params?.limit) queryString.set("limit", params.limit.toString());
        if (params?.status) queryString.set("status", params.status);
        return {
          url: `/orders?${queryString.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Seller", "Order"],
    }),

    // Get order details
    getSellerOrderDetails: builder.query<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: "GET",
      }),
      providesTags: ["Seller", "Order"],
    }),

    // Accept order
    acceptOrder: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/accept`,
        method: "PATCH",
      }),
      invalidatesTags: ["Seller", "Order"],
    }),

    // Reject order
    rejectOrder: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["Seller", "Order"],
    }),

    // Ship order
    shipOrder: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/ship`,
        method: "PATCH",
      }),
      invalidatesTags: ["Seller", "Order"],
    }),

    // Complete order
    completeOrder: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Seller", "Order"],
    }),

    // Get seller products
    getSellerProducts: builder.query<SellerProductsResponse, { page?: number; limit?: number }>({
      query: (params) => {
        const queryString = new URLSearchParams();
        if (params?.page) queryString.set("page", params.page.toString());
        if (params?.limit) queryString.set("limit", params.limit.toString());
        return {
          url: `/seller/products?${queryString.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Seller", "Product"],
    }),

    // Update seller profile
    updateSellerProfile: builder.mutation<{ success: boolean; message: string }, UpdateSellerProfileRequest>({
      query: (data) => ({
        url: "/sellers/profile",
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Seller", "User"],
    }),

    // Upload store logo
    uploadStoreLogo: builder.mutation<{ success: boolean; message: string; logoUrl: string }, FormData>({
      query: (formData) => ({
        url: "/sellers/profile/logo",
        method: "POST",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["Seller", "User"],
    }),

    getSellerProfile: builder.query<
      {
        sellerProfile: {
          storeName: string;
          storeDescription: string;
          storeLogo: string | null;
          phone: string;
          user: {
            email: string;
          };
        };
      },
      void
    >({
      query: () => ({
        url: "/sellers/profile",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Seller", "User"],
    }),

    // Admin endpoints for seller management
    getAllSellers: builder.query<{
      sellers: Array<{
        id: string;
        name: string;
        email: string;
        sellerStatus: string;
        createdAt: string;
        sellerProfile: {
          storeName: string;
          phone?: string;
          address?: string;
        } | null;
      }>;
      totalPages: number;
      totalResults: number;
      resultsPerPage: number;
      currentPage: number;
    }, { status?: string; searchQuery?: string; page?: number; limit?: number }>({
      query: (params) => {
        const queryString = new URLSearchParams();

        if (params?.status) queryString.set("status", params.status);
        if (params?.searchQuery) queryString.set("searchQuery", params.searchQuery);
        if (params?.page) queryString.set("page", params.page.toString());
        if (params?.limit) queryString.set("limit", params.limit.toString());

        return {
          url: `/admin/sellers?${queryString.toString()}`,
          method: "GET",
        };
      },

      transformResponse: (response: any) => {
        return {
          sellers: response.sellers ?? [],
          totalPages: response.totalPages ?? 1,
          totalResults: response.total ?? 0,
          resultsPerPage: response.limit ?? 10,
          currentPage: response.page ?? 1,
        };
      },

      providesTags: ["Seller"],
    }),

    getSellerById: builder.query<{
      seller: {
        id: string;
        userId: string;
        storeName: string;
        description?: string;
        logo?: string;
        status: string;
        appliedDate: string;
        approvedDate?: string;
        rejectedDate?: string;
        suspendedDate?: string;
        user: {
          id: string;
          name: string;
          email: string;
          phone?: string;
        };
        businessDetails?: {
          taxId?: string;
          businessLicense?: string;
          address?: string;
        };
      };
    }, string>({
      query: (id) => ({
        url: `/sellers/${id}`,
        method: "GET",
      }),
      providesTags: ["Seller"],
    }),

    approveSeller: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/admin/sellers/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["Seller", "User"],
    }),

    rejectSeller: builder.mutation<{ success: boolean; message: string }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/sellers/${id}/reject`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Seller", "User"],
    }),

    suspendSeller: builder.mutation<{ success: boolean; message: string }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/sellers/${id}/suspend`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Seller", "User"],
    }),

    getPendingSellersCount: builder.query<{
        success: boolean;
        message: string;
        sellers: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }, void>({
      query: () => ({
        url: "/admin/sellers/pending",
        method: "GET",
      }),
      providesTags: ["Seller"],
    }),

    // Become a seller (for existing users)
    becomeSeller: builder.mutation<
      { success: boolean; message: string; user?: any },
      {
        storeName: string;
        description: string;
        phone: string;
        businessAddress: string;
      }
    >({
      query: (data) => ({
        url: "/sellers/apply",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Seller", "User"],
    }),
  }),
});

export const {
  useGetSellerAnalyticsQuery,
  useGetSellerOrdersQuery,
  useGetSellerProductsQuery,
  useUpdateSellerProfileMutation,
  useGetSellerProfileQuery,
  useUploadStoreLogoMutation,
  useGetAllSellersQuery,
  useGetSellerByIdQuery,
  useApproveSellerMutation,
  useRejectSellerMutation,
  useSuspendSellerMutation,
  useGetPendingSellersCountQuery,
  useBecomeSellerMutation,
  useGetSellerOrderDetailsQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useShipOrderMutation,
  useCompleteOrderMutation,
} = sellerApi;

