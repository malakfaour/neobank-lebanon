import { create } from "zustand";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  kyc_status: "pending" | "approved" | "flagged" | "rejected";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  setToken: (token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
    set({ accessToken: token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
