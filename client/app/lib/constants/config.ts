const API_PATH = "/api/v1";

export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? `${process.env.NEXT_PUBLIC_API_URL_PROD}${API_PATH}` 
    : `${process.env.NEXT_PUBLIC_API_URL_DEV}${API_PATH}`;

export const AUTH_API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? `${process.env.NEXT_PUBLIC_API_URL_PROD}${API_PATH}`
    : `${process.env.NEXT_PUBLIC_API_URL_DEV}${API_PATH}`; ;

export const GRAPHQL_URL = `${API_BASE_URL}/graphql`;

// Add validation and fallback for critical URLs
export const validateApiUrls = () => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL is not configured. Using fallback.");
    return false;
  }
  return true;
};

// Log configuration for debugging
if (typeof window === 'undefined') {
  console.log("Environment:", process.env.NODE_ENV);
  console.log("API_BASE_URL:", API_BASE_URL);
  console.log("GRAPHQL_URL:", GRAPHQL_URL);
}
