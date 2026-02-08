import { create } from "zustand";

export const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: null,

  setAuth: ({ accessToken, refreshToken, user }) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({
      accessToken,
      refreshToken,
      user,
    });
  },

  updateAccessToken: (newAccessToken) => {
    localStorage.setItem("accessToken", newAccessToken);
    set({ accessToken: newAccessToken });
  },

  clearAuth: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ accessToken: null, refreshToken: null, user: null });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));