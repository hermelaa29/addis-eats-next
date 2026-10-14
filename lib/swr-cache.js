'use client';

import { SWRConfig } from "swr";
import { useEffect, useState } from "react";

const CACHE_STORAGE_KEY = "addis-eats-swr-persistent-cache";

/**
 * Creates a persistent SWR cache provider backed by localStorage.
 * Restores all cached data on page load so SWR never needs to hit the server on reload.
 */
export function localStorageProvider() {
  if (typeof window === "undefined") {
    return new Map();
  }

  // Restore map from localStorage on client boot
  let map;
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    map = new Map(raw ? JSON.parse(raw) : []);
  } catch (err) {
    console.warn("Could not restore SWR cache from localStorage:", err);
    map = new Map();
  }

  // Sync to localStorage before unload or on visibility change
  const syncStorage = () => {
    try {
      // Filter out non-serializable or live entries if needed
      const entries = Array.from(map.entries()).filter(([key]) => {
        return typeof key === "string" && !key.startsWith("$req$");
      });
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      // QuotaExceededError safeguard
    }
  };

  window.addEventListener("beforeunload", syncStorage);
  window.addEventListener("pagehide", syncStorage);

  // Intercept map.set to auto-persist important cache keys
  const originalSet = map.set.bind(map);
  map.set = (key, value) => {
    const res = originalSet(key, value);
    if (typeof key === "string" && (key.includes("menu") || key.includes("dishes"))) {
      try {
        const entries = Array.from(map.entries()).filter(([k]) => typeof k === "string" && !k.startsWith("$req$"));
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(entries));
      } catch {}
    }
    return res;
  };

  return map;
}

/**
 * Global SWR Provider Component
 * Enforces persistent caching, aggressive deduplication, and prevents unnecessary network refetches.
 */
export function AppSWRConfig({ children }) {
  const [provider, setProvider] = useState(() => (typeof window !== "undefined" ? localStorageProvider : () => new Map()));

  useEffect(() => {
    setProvider(() => localStorageProvider);
  }, []);

  return (
    <SWRConfig
      value={{
        provider,
        revalidateIfStale: false, // Rely on cache first, do not force background network request
        revalidateOnFocus: false, // Tab focus does not hit server
        revalidateOnReconnect: false, // Reconnect does not hit server
        dedupingInterval: 1000 * 60 * 60 * 24, // 24-hour deduplication window
        shouldRetryOnError: false,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
