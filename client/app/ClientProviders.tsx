"use client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ApolloProvider } from "@apollo/client";
import { Suspense } from "react";
import client from "./lib/apolloClient";
import Toast from "./components/feedback/Toast";
import AuthProvider from "./components/HOC/AuthProvider";
import TopLoadingBar from "./components/feedback/TopLoadingBar";
import ErrorBoundary from "./components/ErrorBoundary";

function ApolloProviderWithErrorBoundary({ children }: { children: React.ReactNode }) {
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ApolloProviderWithErrorBoundary>
        <TopLoadingBar />
        <Provider store={store}>
          <AuthProvider>{children}</AuthProvider>
          {process.env.NODE_ENV !== "test" && <Toast />}
        </Provider>
      </ApolloProviderWithErrorBoundary>
    </Suspense>
  );
}
