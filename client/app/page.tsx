"use client";
import dynamic from "next/dynamic";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_SUMMARY } from "./gql/Product";
import { useMemo } from "react";
import groupProductsByFlag from "./utils/groupProductsByFlag";
import SkeletonLoader from "./components/feedback/SkeletonLoader";

const HeroSection = dynamic(() => import("./(public)/(home)/HeroSection"), {
  ssr: false,
});
const CategoryBar = dynamic(() => import("./(public)/(home)/CategoryBar"), {
  ssr: false,
});
const ProductSection = dynamic(
  () => import("./(public)/product/ProductSection"),
  { ssr: false }
);
const MainLayout = dynamic(() => import("./components/templates/MainLayout"), {
  ssr: false,
});

const Home = () => {
  const { data, loading, error } = useQuery(GET_PRODUCTS_SUMMARY, {
    variables: { first: 100 },
    fetchPolicy: "no-cache",
    errorPolicy: 'all',
    onError: (err) => {
      console.error("GraphQL query error:", err);
    }
  });

  const { featured, trending, newArrivals, bestSellers } = useMemo(() => {
    if (!data?.products?.products)
      return { featured: [], trending: [], newArrivals: [], bestSellers: [] };
    return groupProductsByFlag(data.products.products);
  }, [data]);

  // Show error state if GraphQL fails
  if (error && !loading) {
    return (
      <MainLayout>
        <HeroSection />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-lg text-red-500 mb-4">Unable to load products</p>
            <p className="text-sm text-gray-600">Please check your connection and try again</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <HeroSection />
        <SkeletonLoader />
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
