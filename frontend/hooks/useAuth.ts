import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

export function useAuth() {
  const { user, isAuthenticated, setUser, setToken, logout } = useAuthStore();

  const login = async (phone: string, passcode: string) => {
    const res = await api.post("/auth/login", { phone, passcode });
    const { access_token, user } = res.data;
    setToken(access_token);
    setUser(user);
    return user;
  };

  return { user, isAuthenticated, login, logout };
}