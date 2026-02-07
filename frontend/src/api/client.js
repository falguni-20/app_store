import axios from "axios";
import { useTenantStore } from "../store/tenantStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const { orgId, instituteId } = useTenantStore.getState();

  if (orgId) config.headers["x-org-id"] = orgId;
  if (instituteId) config.headers["x-institute-id"] = instituteId;

  return config;
});

export default api;
