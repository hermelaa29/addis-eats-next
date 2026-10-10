import { create } from "zustand";

// Zustand store for Toast Notifications
export const useToastStore = create((set) => ({
  message: null,
  showToast: (message) => {
    set({ message });
    // Automatically clear the toast after 3 seconds
    setTimeout(() => {
      set((state) => (state.message === message ? { message: null } : state));
    }, 3000);
  },
  hideToast: () => set({ message: null }),
}));
