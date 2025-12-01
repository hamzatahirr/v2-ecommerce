import { apiSlice } from "../slices/ApiSlice";

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrders: builder.query({
      query: () => ({
        url: "/orders",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Order"],
    }),

    getUserOrders: builder.query({
      query: () => ({
        url: "/orders/user",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Order"],
    }),

    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/orders",
        method: "POST",
        body: orderData,
        credentials: "include",
      }),
      invalidatesTags: ["Order", "Cart"],
    }),

    deleteOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Order"],
    }),

    updateOrder: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}`,
        method: "PUT",
        body: { status },
        credentials: "include",
      }),
      invalidatesTags: ["Order"],
    }),

    getOrder: builder.query({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Order"],
    }),

    // Order management actions
    acceptOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/accept`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: ["Order", "Seller"],
    }),

    rejectOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/reject`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: ["Order", "Seller"],
    }),

    shipOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/ship`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: ["Order", "Seller"],
    }),

    completeOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/complete`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: ["Order", "Seller"],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetUserOrdersQuery,
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useUpdateOrderMutation,
  useGetOrderQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useShipOrderMutation,
  useCompleteOrderMutation,
} = orderApi;
