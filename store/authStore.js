import { create } from "zustand";
import { useAdminAuthStore } from "./adminAuthStore";

// Helper to read initial user from local storage
const readUser = () => {
  try {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("addis-eats-user"));
    }
    return null;
  } catch {
    return null;
  }
};

// Zustand store for Authentication
export const useAuthStore = create((set) => ({
  // State
  user: readUser(),

  // Actions
  signIn: (name, email, password) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === "admin@gmail.com" && password === "admin";

    const nextUser = {
      name: cleanName,
      email: cleanEmail,
      password,
      isAdmin,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("addis-eats-user", JSON.stringify(nextUser));

      // Sync with admin store
      if (isAdmin) {
        localStorage.setItem("addis-eats-admin", "true");
        useAdminAuthStore.setState({ admin: true });
      } else {
        localStorage.removeItem("addis-eats-admin");
        useAdminAuthStore.setState({ admin: false });
      }
    }

    set({ user: nextUser });
    return isAdmin;
  },

  signOut: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("addis-eats-user");
      localStorage.removeItem("addis-eats-admin");
      useAdminAuthStore.setState({ admin: false });
    }
    set({ user: null });
  },
}));
