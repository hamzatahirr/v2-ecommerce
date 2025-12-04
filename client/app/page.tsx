"use client";
import dynamic from "next/dynamic";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_SUMMARY } from "./gql/Product";
import { useMemo, useState, useEffect } from "react";
import groupProductsByFlag from "./utils/groupProductsByFlag";
import SkeletonLoader from "./components/feedback/SkeletonLoader";

const HeroSection = dynamic(() => import("./(public)/(home)/HeroSection"), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
});
const CategoryBar = dynamic(() => import("./(public)/(home)/CategoryBar"), {
  ssr: false,
  loading: () => <div className="h-16 bg-gray-100 animate-pulse" />
});
const ProductSection = dynamic(
  () => import("./(public)/product/ProductSection"),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
  }
);
const MainLayout = dynamic(() => import("./components/templates/MainLayout"), {
  ssr: false,
  loading: () => <div>Loading layout...</div>
});

const Home = () => {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS_SUMMARY, {
    variables: { first: 100 },
    fetchPolicy: "cache-first",
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: false,
    skip: !hasMounted,
    onError: (err) => {
      console.error("GraphQL query error:", err);
    }
  });

  const { featured, trending, newArrivals, bestSellers } = useMemo(() => {
    if (!data?.products?.products)
      return { featured: [], trending: [], newArrivals: [], bestSellers: [] };
    return groupProductsByFlag(data.products.products);
  }, [data]);

  // Show initial loading state
  if (!hasMounted || loading) {
    return (
      <MainLayout>
        <HeroSection />
        <SkeletonLoader />
      </MainLayout>
    );
  }

  // Show error state with retry option
  if (error && !data?.products?.products) {
    return (
      <MainLayout>
        <HeroSection />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-lg text-red-500 mb-4">Unable to load products</p>
            <p className="text-sm text-gray-600 mb-4">Please check your connection and try again</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <HeroSection />
      <CategoryBar />
      <ProductSection
        title="Featured"
        products={featured}
        loading={false}
        error={error}
        showTitle={true}
      />
      <ProductSection
        title="Trending"
        products={trending}
        loading={false}
        error={error}
        showTitle={true}
      />
      <ProductSection
        title="New Arrivals"
        products={newArrivals}
        loading={false}
        error={error}
        showTitle={true}
      />
      <ProductSection
        title="Best Sellers"
        products={bestSellers}
        loading={false}
        error={error}
        showTitle={true}
      />
    </MainLayout>
  );
};

export default Home;
