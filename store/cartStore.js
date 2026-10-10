import { create } from "zustand";

// Helper to load initial cart state from local storage
function readCart() {
  try {
    if (typeof window !== "undefined") {
      const parsed = JSON.parse(localStorage.getItem("addis-eats-cart"));
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch {
    return [];
  }
}

// Zustand store for the Shopping Cart
export const useCartStore = create((set, get) => ({
  // State
  items: readCart(),

  // Actions
  addItem: (dish) => {
    set((state) => {
      const existing = state.items.find((item) => item.dish.id === dish.id);
      const next = existing
        ? state.items.map((item) =>
            item.dish.id === dish.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...state.items, { dish, quantity: 1 }];
      if (typeof window !== "undefined") {
        localStorage.setItem("addis-eats-cart", JSON.stringify(next));
      }
      return { items: next };
    });
  },

  increase: (id) => {
    set((state) => {
      const next = state.items.map((item) =>
        item.dish.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("addis-eats-cart", JSON.stringify(next));
      }
      return { items: next };
    });
  },

  decrease: (id) => {
    set((state) => {
      const next = state.items
        .map((item) =>
          item.dish.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);
      if (typeof window !== "undefined") {
        localStorage.setItem("addis-eats-cart", JSON.stringify(next));
      }
      return { items: next };
    });
  },

  removeItem: (id) => {
    set((state) => {
      const next = state.items.filter((item) => item.dish.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("addis-eats-cart", JSON.stringify(next));
      }
      return { items: next };
    });
  },

  clearCart: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("addis-eats-cart", JSON.stringify([]));
    }
    set({ items: [] });
  },

  // Derived state getters
  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.dish.price * item.quantity,
      0
    );
  },
}));
