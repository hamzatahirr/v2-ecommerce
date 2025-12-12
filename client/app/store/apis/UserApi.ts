import { User } from "@/app/types/authTypes";
import { apiSlice } from "../slices/ApiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => ({
        url: "/users",
      }),
      providesTags: ["User"],
    }),
    getAllAdmins: builder.query({
      query: () => ({
        url: "/users/admins",
      }),
      providesTags: ["User"],
    }),
    getProfile: builder.query({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getUserProfile: builder.query({
      query: (id) => ({
        url: `/users/${id}/verification`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    getMe: builder.query<User, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    createAdmin: builder.mutation({
      query: (data) => ({
        url: "/users/admin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // Verification endpoints
    submitVerification: builder.mutation({
      query: (data) => ({
        url: "/users/verification/submit",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    reviewVerification: builder.mutation({
      query: (data) => ({
        url: "/users/verification/review",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    getUsersByVerificationStatus: builder.query({
      query: (status) => ({
        url: `/users/verification/status/${status}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    getUserVerificationDetails: builder.query({
      query: (userId) => ({
        url: `/users/${userId}/verification`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useGetAllAdminsQuery,
  useUpdateUserMutation,
  useCreateAdminMutation,
  useDeleteUserMutation,
  useGetProfileQuery,
  useGetUserProfileQuery,
  useGetMeQuery,
  useGetAllUsersQuery,
  useLazyGetMeQuery,
  // Verification hooks
  useSubmitVerificationMutation,
  useReviewVerificationMutation,
  useGetUsersByVerificationStatusQuery,
  useGetUserVerificationDetailsQuery,
} = userApi;
