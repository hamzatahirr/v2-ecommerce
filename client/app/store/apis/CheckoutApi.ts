import { apiSlice } from "../slices/ApiSlice";

export const checkoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initiateCheckout: builder.mutation({
      query: (data?: { paymentMethod?: "STRIPE" | "CASH_ON_DELIVERY" }) => {
        const { paymentMethod = "STRIPE" } = data || {};

        // TESTING: Payment bypassed - START
        // When BYPASS_PAYMENTS is enabled, skip Stripe checkout
        if (process.env.NEXT_PUBLIC_BYPASS_PAYMENTS === "true") {
          // Return a mock response that will trigger direct order creation
          return {
            url: "/checkout",
            method: "POST",
            body: { paymentMethod },
            credentials: "include",
            // Backend should handle bypass logic
          };
        }
        // TESTING: Payment bypassed - END

        return {
          url: "/checkout",
          method: "POST",
          body: { paymentMethod },
          credentials: "include",
        };
      },
    }),
  }),
});

export const { useInitiateCheckoutMutation } = checkoutApi;
