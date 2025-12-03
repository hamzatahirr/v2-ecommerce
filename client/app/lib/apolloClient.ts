import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { GRAPHQL_URL } from "./constants/config";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    console.error("GraphQL Error:", graphQLErrors);
    // Don't crash the app, just log the errors
  }
  if (networkError) {
    console.error("Network Error:", networkError);
    // Don't crash the app, just log the error
  }
});

console.log("GRAPHQL_URL: ", GRAPHQL_URL);

export const initializeApollo = (initialState = null) => {
  const httpLink = new HttpLink({
    uri: GRAPHQL_URL,
    credentials: "include",
  });

  // Create or reuse Apollo Client instance with error handling
  const client = new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Product: {
          fields: {
            variants: {
              merge: true,
            },
          },
        },
      },
    }).restore(initialState || {}),
    // Add default options to handle errors gracefully
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'ignore',
        notifyOnNetworkStatusChange: true,
      },
      query: {
        errorPolicy: 'all',
      },
    },
    // Disable SSR queries that might fail
    ssrMode: typeof window === 'undefined',
  });

  return client;
};

export default initializeApollo(); // Default export for client-side usage
