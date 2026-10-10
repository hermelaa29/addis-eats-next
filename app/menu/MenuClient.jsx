'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const selectedCategory = searchParams.get("category") || "All";
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch] = useDebounce(search, 300);

  // SWR for data fetching with fallbackData
  const { data: baseDishes, error, isLoading } = useSWR('/menu-data.json', fetcher, { 
    fallbackData,
    revalidateOnFocus: false 
  });

  const mods = useAdminModifications();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dishes = useMemo(() => {
    if (!baseDishes) return [];
    if (!mounted) return baseDishes; // Use un-modified baseDishes on server/initial render
    let active = baseDishes.filter((d) => !mods.removed.includes(d.id));
    active = active.map((d) => (mods.updated[d.id] ? { ...d, ...mods.updated[d.id] } : d));
    return [...active, ...mods.added];
  }, [baseDishes, mods, mounted]);

  const pageRef = useRef(null);

  // Sync debounced search to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    router.replace(`/menu?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, searchParams, router]);

  const filteredDishes =
    dishes.filter(
      (dish) =>
        (selectedCategory === "All" || dish.category === selectedCategory) &&
        dish.name.toLowerCase().includes(debouncedSearch.trim().toLowerCase())
    ) || [];

  const chooseCategory = (category) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/menu?${params.toString()}`);
  };

  useEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".page-intro > *", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
      });
      gsap.from(".category-bar", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        ease: "power2.out",
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isLoading || error || filteredDishes.length === 0 || !pageRef.current)
      return;
    const ctx = gsap.context(() => {
      const cards = document.querySelectorAll(".dish-card");
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
