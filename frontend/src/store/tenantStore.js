import { create } from "zustand";

export const useTenantStore = create((set) => ({
  orgId: null,
  instituteId: null,

  setTenant: ({ orgId, instituteId }) =>
    set({ orgId, instituteId }),

  clearTenant: () =>
    set({ orgId: null, instituteId: null }),
}));
