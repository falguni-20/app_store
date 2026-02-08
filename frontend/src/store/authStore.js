import { create } from "zustand";

export const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,

  setAuth: ({ accessToken, refreshToken, user }) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
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

  initializeAuth: () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

    if (accessToken && refreshToken) {
      // Restore the stored auth state
      set({
        accessToken,
        refreshToken,
        user: storedUser,
      });
    }
  },

  clearAuth: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    set({ accessToken: null, refreshToken: null, user: null });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));