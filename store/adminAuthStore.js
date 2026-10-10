import { create } from "zustand";

const getInitialAdmin = () => {
  try {
    if (typeof window !== "undefined") {
      return localStorage.getItem("addis-eats-admin") === "true";
    }
    return false;
  } catch {
    return false;
  }
};

export const useAdminAuthStore = create(() => ({
  admin: getInitialAdmin(),
  signIn: (email, password) => {
    if (email !== "admin@gmail.com" || password !== "admin123") return false;
    if (typeof window !== "undefined") {
      localStorage.setItem("addis-eats-admin", "true");
    }
    useAdminAuthStore.setState({ admin: true });
    return true;
  },
  signOut: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("addis-eats-admin");
    }
    useAdminAuthStore.setState({ admin: false });
  },
}));
