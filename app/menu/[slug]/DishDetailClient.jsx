'use client';

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import { useToastStore } from "@/store/toastStore";
import { ErrorMessage, Spinner } from "@/components/ui/States";
import gsap from "gsap";

import useSWR from "swr";
import { fetcher, slugify } from "@/lib/dishes";
import { useAdminModifications } from "@/store/dishesStore";

export default function DishDetailClient({ slug, fallbackData }) {
  const { data: baseDishes, error, isLoading } = useSWR('/menu-data.json', fetcher, { 
    fallbackData,
    revalidateOnFocus: false 
  });
  
  const mods = useAdminModifications();
  const data = useMemo(() => {
    if (!baseDishes) return [];
    let active = baseDishes.filter((d) => !mods.removed.includes(d.id));
    active = active.map((d) => (mods.updated[d.id] ? { ...d, ...mods.updated[d.id] } : d));
    return [...active, ...mods.added];
  }, [baseDishes, mods]);

  const dish = data?.find((item) => slugify(item.name) === slug);

  const addItem = useCartStore((state) => state.addItem);
  const itemCount = useCartStore((state) => state.getItemCount());
  const showToast = useToastStore((state) => state.showToast);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pageRef = useRef(null);

  const handleAddToCart = () => {
    addItem(dish);
    showToast("Added to cart");
  };

  useEffect(() => {
    if (!dish || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".detail-art", {
        x: -40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
      gsap.from(".detail-copy > *", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.1,
      });
    }, pageRef);
    return () => ctx.revert();
  }, [dish]);

  if (isLoading)
    return (
      <main className="page">
        <Spinner label="Finding that dish" />
      </main>
    );
  if (error)
    return (
      <main className="page">
        <ErrorMessage onRetry={() => window.location.reload()} />
      </main>
    );
  if (!dish)
    return (
      <main className="page narrow">
        <div className="state state-empty">
          <span className="state-mark">?</span>
          <h1>Dish not found</h1>
          <p>
            That dish may have moved off the menu. There are plenty more good
            things to try.
          </p>
          <Link className="button button-dark" href="/menu">
            Back to menu
          </Link>
        </div>
      </main>
    );

  return (
    <main className="page" ref={pageRef}>
      <Link className="back-link" href="/menu">
        ← Back to menu
      </Link>
      <section className="detail-layout">
        <div
          className={`detail-art accent-${dish.accent}`}
          style={{ position: "relative", overflow: "hidden" }}
        >
          <Image src={dish.image} alt={dish.name} fill style={{ objectFit: "cover" }} priority={true} sizes="(max-width: 1024px) 100vw, 50vw" />
          <small style={{ position: "relative", zIndex: 2 }}>{dish.tag}</small>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{dish.category}</p>
          <h1>{dish.name}</h1>
          <p className="detail-description">{dish.description}</p>
          <div className="detail-price">
            {dish.price} <small>ETB</small>
          </div>
          <button className="button button-dark" onClick={handleAddToCart}>
            Add to order <span>+</span>
          </button>
          {mounted && itemCount > 0 && (
            <Link className="detail-cart" href="/cart">
              Your bag has {itemCount} {itemCount === 1 ? "item" : "items"} →
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
