import axios from "axios";
import { useTenantStore } from "../store/tenantStore";
import { useAuthStore } from "../store/authStore"; // Import auth store

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

// Request interceptor to attach access token and tenant headers
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState(); // Get accessToken from store
  const { orgId, instituteId } = useTenantStore.getState(); // Get tenant IDs from store

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Attach tenant headers if available
  if (orgId) {
    config.headers["x-org-id"] = orgId;
  }
  if (instituteId) {
    config.headers["x-institute-id"] = instituteId;
  }

  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken: newAccessToken } = response.data;
        useAuthStore.getState().updateAccessToken(newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;