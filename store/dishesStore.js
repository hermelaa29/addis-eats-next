import { create } from "zustand";
import { useAdminAuthStore } from "./adminAuthStore";

const ADMIN_STORAGE_KEY = "addis-eats-admin-modifications";

function getAdminModifications() {
  try {
    if (typeof window !== "undefined") {
      const parsed = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY));
      return {
        updated: parsed?.updated || {},
        added: parsed?.added || [],
        removed: parsed?.removed || [],
      };
    }
    return { updated: {}, added: [], removed: [] };
  } catch {
    return { updated: {}, added: [], removed: [] };
  }
}

function saveAdminModifications(mods) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(mods));
    window.dispatchEvent(new Event("admin-mods-updated"));
  }
}

import { useState, useEffect } from "react";

export function useAdminModifications() {
  const [mods, setMods] = useState({ updated: {}, added: [], removed: [] });
  useEffect(() => {
    setMods(getAdminModifications());
    const handleUpdate = () => setMods(getAdminModifications());
    window.addEventListener("admin-mods-updated", handleUpdate);
    return () => window.removeEventListener("admin-mods-updated", handleUpdate);
  }, []);
  return mods;
}

export const useDishesStore = create((set, get) => ({
  dishes: [],
  loading: true,
  error: null,

  fetchDishes: async () => {
    if (get().dishes.length > 0 && !get().loading) return; // Already loaded

    set({ loading: true, error: null });
    try {
      const response = await fetch("/menu-data.json");
      if (!response.ok) throw new Error("Failed to fetch dishes");
      const baseDishes = await response.json();

      const mods = getAdminModifications();

      // Apply removed
      let activeDishes = baseDishes.filter((d) => !mods.removed.includes(d.id));

      // Apply updated
      activeDishes = activeDishes.map((d) =>
        mods.updated[d.id] ? { ...d, ...mods.updated[d.id] } : d
      );

      // Apply added
      activeDishes = [...activeDishes, ...mods.added];

      set({ dishes: activeDishes, loading: false });
    } catch (err) {
      set({ error: err, loading: false });
    }
  },

  addDish: (dish) => {
    const newDish = {
      ...dish,
      id: dish.id || `AE-${Date.now()}`,
      available: dish.available ?? true,
    };
    const mods = getAdminModifications();
    mods.added.push(newDish);
    saveAdminModifications(mods);
    set((state) => ({ dishes: [...state.dishes, newDish] }));
  },

  updateDish: (id, updates) => {
    const mods = getAdminModifications();
    const addedIndex = mods.added.findIndex((d) => d.id === id);
    if (addedIndex >= 0) {
      mods.added[addedIndex] = { ...mods.added[addedIndex], ...updates };
    } else {
      mods.updated[id] = { ...(mods.updated[id] || {}), ...updates };
    }
    saveAdminModifications(mods);
    set((state) => ({
      dishes: state.dishes.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    }));
  },

  removeDish: (id) => {
    const mods = getAdminModifications();
    const addedIndex = mods.added.findIndex((d) => d.id === id);
    if (addedIndex >= 0) {
      mods.added.splice(addedIndex, 1);
    } else {
      mods.removed.push(id);
    }
    saveAdminModifications(mods);
    set((state) => ({
      dishes: state.dishes.filter((d) => d.id !== id),
    }));
  },
}));
