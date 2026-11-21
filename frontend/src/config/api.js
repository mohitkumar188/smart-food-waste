/**
 * Centralized API configuration for AnnaSetu AI Frontend
 * Automatically handles Vercel -> Render cross-origin URLs without double slashes
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
