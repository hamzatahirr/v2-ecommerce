"use client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ApolloProvider } from "@apollo/client";
import { Suspense, useEffect, useState } from "react";
import { initializeApollo } from "./lib/apolloClient";
import Toast from "./components/feedback/Toast";
import AuthProvider from "./components/HOC/AuthProvider";
import TopLoadingBar from "./components/feedback/TopLoadingBar";
import ErrorBoundary from "./components/ErrorBoundary";

function ApolloProviderWithErrorBoundary({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const apolloClient = initializeApollo();
      setClient(apolloClient);
    } catch (err) {
      console.error("Apollo Client initialization failed:", err);
      setError("Failed to initialize Apollo Client");
    }
  }, []);

  if (error) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-red-500 mb-4">Service temporarily unavailable</p>
            <p className="text-sm text-gray-600">Please try again in a few moments</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
    </ErrorBoundary>
  );
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <ApolloProviderWithErrorBoundary>
          <TopLoadingBar />
          <Provider store={store}>
            <AuthProvider>{children}</AuthProvider>
            {process.env.NODE_ENV !== "test" && <Toast />}
          </Provider>
        </ApolloProviderWithErrorBoundary>
      </Suspense>
    </ErrorBoundary>
  );
}
