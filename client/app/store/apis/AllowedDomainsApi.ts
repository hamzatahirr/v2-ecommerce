import { apiSlice } from "../slices/ApiSlice";

export const allowedDomainsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDomains: builder.query({
      query: ({ page = 1, limit = 20 }) => ({
        url: "/allowed-domains",
        params: { page, limit },
      }),
      providesTags: ["AllowedDomains"],
    }),
    
    getActiveDomains: builder.query({
      query: () => ({
        url: "/allowed-domains/active",
      }),
      providesTags: ["AllowedDomains"],
    }),
    
    createDomain: builder.mutation({
      query: (data) => ({
        url: "/allowed-domains",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AllowedDomains"],
    }),
    
    updateDomain: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/allowed-domains/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AllowedDomains"],
    }),
    
    deleteDomain: builder.mutation({
      query: (id) => ({
        url: `/allowed-domains/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AllowedDomains"],
    }),
    
    toggleDomainStatus: builder.mutation({
      query: (id) => ({
        url: `/allowed-domains/${id}/toggle`,
        method: "PUT",
      }),
      invalidatesTags: ["AllowedDomains"],
    }),
    
    bulkCreateDomains: builder.mutation({
      query: (domains) => ({
        url: "/allowed-domains/bulk",
        method: "POST",
        body: { domains },
      }),
      invalidatesTags: ["AllowedDomains"],
    }),
    
    validateEmail: builder.mutation({
      query: (email) => ({
        url: "/allowed-domains/validate-email",
        method: "POST",
        body: { email },
      }),
      invalidatesTags: ["AllowedDomains"],
    }),
  }),
});

export const {
  useGetDomainsQuery: useGetAllowedDomainsQuery,
  useGetActiveDomainsQuery,
  useCreateDomainMutation,
  useUpdateDomainMutation,
  useDeleteDomainMutation,
  useToggleDomainStatusMutation,
  useBulkCreateDomainsMutation,
  useValidateEmailMutation,
} = allowedDomainsApi;

// Also export the correct name directly
// export const useGetAllowedDomainsQuery = allowedDomainsApi.useGetDomainsQuery;