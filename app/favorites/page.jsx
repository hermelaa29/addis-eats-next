'use client';

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useDishesStore } from "@/store/dishesStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import DishCard from "@/components/DishCard";
import { EmptyState, ErrorMessage, Spinner } from "@/components/ui/States";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRequireAuth } from "@/lib/useRequireAuth";

gsap.registerPlugin(ScrollTrigger);

export default function FavoritesPage() {
  const { isReady } = useRequireAuth("/favorites");
  const { dishes, loading, error, fetchDishes } = useDishesStore();

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const favoriteDishes =
    dishes?.filter((dish) => favoriteIds.includes(dish.id)) || [];

  const pageRef = useRef(null);

  useEffect(() => {
    if (!isReady || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".page-intro > *", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, pageRef);
    return () => ctx.revert();
  }, [isReady]);

  useEffect(() => {
    if (!isReady || loading || error || favoriteDishes.length === 0 || !pageRef.current)
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
  }, [isReady, loading, error, favoriteDishes.length]);

  if (!isReady) return null; // redirect in progress

  return (
    <main className="page favorites-page" ref={pageRef}>
      <div className="page-intro">
        <p className="eyebrow">Your saved table</p>
        <h1>Favourite dishes.</h1>
        <p>Keep the dishes you love close for your next Addis Eats order.</p>
      </div>
      {loading && <Spinner label="Finding your favourites" />}
      {error && <ErrorMessage onRetry={() => window.location.reload()} />}
      {!loading && !error && favoriteDishes.length === 0 && (
        <EmptyState
          title="Your favourites are waiting"
          message="Tap the heart on any dish to keep it here for later."
          action={
            <Link className="button button-dark" href="/menu">
              Explore the menu
            </Link>
          }
        />
      )}
      {!loading && !error && favoriteDishes.length > 0 && (
        <div className="dish-grid">
          {favoriteDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      )}
    </main>
  );
}
