'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * Redirects to /login if the user is not signed in.
 * Returns { user, isReady } so the calling page can guard rendering.
 */
export function useRequireAuth(returnPath) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user === null) {
      router.replace(`/login?returnTo=${encodeURIComponent(returnPath || "/")}`);
    }
  }, [user, router, mounted, returnPath]);

  return { user, isReady: mounted && user !== null };
}
