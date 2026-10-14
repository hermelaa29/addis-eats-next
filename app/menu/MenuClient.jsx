'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { categories, fetcher } from "@/lib/dishes";
import { useAdminModifications } from "@/store/dishesStore";
import DishCard from "@/components/DishCard";
import { EmptyState, ErrorMessage, Spinner } from "@/components/ui/States";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useSWR from "swr";
import { useDebounce } from "use-debounce";

gsap.registerPlugin(ScrollTrigger);

export default function MenuClient({ fallbackData }) {
  const searchParams = useSearchParams();
  
  // Initialize state from URL params once on mount
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams?.get("category") || "All"
  );
  const [search, setSearch] = useState(() => searchParams?.get("q") || "");
  const [debouncedSearch] = useDebounce(search, 300);

  // SWR for data fetching with 100% persistent caching and NO mount-time refetches
  const { data: baseDishes, error, isLoading } = useSWR('/menu-data.json', fetcher, { 
    fallbackData,
    revalidateOnMount: false, // Use pre-cached data immediately without firing a network request!
    revalidateOnFocus: false, // Do not refetch on window focus
    revalidateIfStale: false, // Never force background server request when cache exists
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 60 * 24, // 24-hour deduplication
  });

  const mods = useAdminModifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Pre-cache fallbackData in persistent storage if present
    if (fallbackData && Array.isArray(fallbackData) && fallbackData.length > 0) {
      try {
        localStorage.setItem("addis-eats-cache:/menu-data.json", JSON.stringify(fallbackData));
      } catch {}
    }
  }, [fallbackData]);

  const dishes = useMemo(() => {
    if (!baseDishes) return [];
    if (!mounted) return baseDishes; // Use un-modified baseDishes on server/initial render
    let active = baseDishes.filter((d) => !mods.removed.includes(d.id));
    active = active.map((d) => (mods.updated[d.id] ? { ...d, ...mods.updated[d.id] } : d));
    return [...active, ...mods.added];
  }, [baseDishes, mods, mounted]);

  const pageRef = useRef(null);

  // Sync debounced search to URL using HTML5 History API
  // This updates the browser address bar cleanly WITHOUT triggering Next.js RSC network requests
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentParams = new URLSearchParams(window.location.search);
    const currentQ = currentParams.get("q") || "";

    if (currentQ !== debouncedSearch.trim()) {
      if (debouncedSearch.trim()) {
        currentParams.set("q", debouncedSearch.trim());
      } else {
        currentParams.delete("q");
      }
      const qs = currentParams.toString();
      const newUrl = qs ? `/menu?${qs}` : "/menu";
      window.history.replaceState(null, "", newUrl);
    }
  }, [debouncedSearch]);

  const chooseCategory = (category) => {
    setSelectedCategory(category);
    if (typeof window === "undefined") return;
    const currentParams = new URLSearchParams(window.location.search);
    if (category === "All") {
      currentParams.delete("category");
    } else {
      currentParams.set("category", category);
    }
    const qs = currentParams.toString();
    const newUrl = qs ? `/menu?${qs}` : "/menu";
    window.history.replaceState(null, "", newUrl);
  };

  const filteredDishes = useMemo(() => {
    return dishes.filter(
      (dish) =>
        (selectedCategory === "All" || dish.category === selectedCategory) &&
        dish.name.toLowerCase().includes(debouncedSearch.trim().toLowerCase())
    ) || [];
  }, [dishes, selectedCategory, debouncedSearch]);

  useEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      const intro = pageRef.current.querySelectorAll(".page-intro > *");
      if (intro.length > 0) {
        gsap.from(intro, {
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
        });
      }
      const bar = pageRef.current.querySelector(".category-bar");
      if (bar) {
        gsap.from(bar, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          delay: 0.2,
          ease: "power2.out",
        });
      }
    }, pageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isLoading || error || filteredDishes.length === 0 || !pageRef.current)
      return;
    const ctx = gsap.context(() => {
      const cards = pageRef.current.querySelectorAll(".dish-card");
      if (cards.length > 0) {
        cards.forEach((card) => {
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
            y: 60,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            delay: 0.1,
          });
        });
      }
    }, pageRef);
    return () => ctx.revert();
  }, [isLoading, error, filteredDishes.length]);

  return (
    <main className="page" ref={pageRef}>
      <div className="page-intro">
        <p className="eyebrow">Take your pick</p>
        <h1>The menu</h1>
        <p>
          Familiar favourites and new rituals, made for the way Addis eats
          today.
        </p>
      </div>
      <div className="category-bar" aria-label="Filter menu by category">
        {categories.map((category) => (
          <button
            className={
              selectedCategory === category ? "category active" : "category"
            }
            key={category}
            onClick={() => chooseCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: "40px" }}>
        <label className="search-field" htmlFor="menu-search">
          Search dishes
          <input
            id="menu-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by dish name"
            style={{ marginTop: "10px", width: "100%", maxWidth: "400px" }}
          />
        </label>
      </div>

      {isLoading && <Spinner label="Fetching today's dishes" />}
      {error && <ErrorMessage onRetry={() => window.location.reload()} />}
      {!isLoading && !error && filteredDishes.length === 0 && (
        <EmptyState
          title="Nothing on this table yet"
          message={`We do not have any ${selectedCategory.toLowerCase()} dishes right now. Try another category.`}
          action={
            <button
              className="button button-dark"
              onClick={() => chooseCategory("All")}
            >
              Show all dishes
            </button>
          }
        />
      )}
      {!isLoading && !error && filteredDishes.length > 0 && (
        <div className="dish-grid">
          {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      )}
    </main>
  );
}
