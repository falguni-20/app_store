import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token"),
  user: null,

  setAuth: (data) => {
    localStorage.setItem("token", data.token);
    set({
      token: data.token,
      user: data.user,
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));
