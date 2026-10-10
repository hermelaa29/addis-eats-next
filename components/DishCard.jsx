'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useToastStore } from "@/store/toastStore";
import { slugify } from "@/lib/dishes";

export default function DishCard({ dish }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const addItem = useCartStore((state) => state.addItem);
  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const showToast = useToastStore((state) => state.showToast);

  const isFavorite = mounted && favoriteIds.includes(dish.id);
  const isAvailable = dish.available !== false;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    toggleFavorite(dish.id);
    showToast(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem(dish);
    showToast("Added to cart");
  };

  if (dish.premium) {
    return (
      <article className="premium-dish-card dish-card">
        <Link
          className="premium-dish-image"
          href={`/menu/${slugify(dish.name)}`}
          style={{ position: "relative", overflow: "hidden", display: "block" }}
        >
          <Image src={dish.image} alt={dish.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 50vw" priority={false} />
          <span className="premium-dish-category" style={{ zIndex: 2 }}>{dish.category}</span>
          <button
            className={`premium-favorite ${isFavorite ? "is-favorite" : ""}`}
            onClick={handleFavoriteClick}
            aria-label="Toggle favorite"
            style={{ zIndex: 2 }}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
          <div className="premium-dish-overlay">
            <h3>{dish.name}</h3>
            <p>{dish.description.substring(0, 70)}...</p>
          </div>
        </Link>
        <div className="premium-dish-footer">
          <strong>
            {dish.price} <small>ETB</small>
          </strong>
          <span className="premium-view-link">
            View <span>→</span>
          </span>
          <button
            className="premium-cart-button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            style={{
              opacity: isAvailable ? 1 : 0.5,
              cursor: isAvailable ? "pointer" : "not-allowed",
            }}
          >
            <span>{isAvailable ? "Add +" : "Sold Out"}</span>
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="dish-card">
      <Link
        className="dish-art"
        href={`/menu/${slugify(dish.name)}`}
        style={{ position: "relative", overflow: "hidden", display: "block" }}
      >
        <Image src={dish.image} alt={dish.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={false} />
        <button
          className={`premium-favorite dish-art-favorite ${
            isFavorite ? "is-favorite" : ""
          }`}
          onClick={handleFavoriteClick}
          aria-label={
            isFavorite
              ? `Remove ${dish.name} from favorites`
              : `Add ${dish.name} to favorites`
          }
          aria-pressed={isFavorite}
          style={{ zIndex: 2 }}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </Link>
      <div className="dish-info">
        <div>
          <p className="eyebrow">{dish.category}</p>
          <h3>
            <Link href={`/menu/${slugify(dish.name)}`}>{dish.name}</Link>
          </h3>
        </div>
      </div>
      <div className="premium-dish-footer">
        <strong>
          {dish.price} <small>ETB</small>
        </strong>
        <Link className="premium-view-link" href={`/menu/${slugify(dish.name)}`}>
          View <span>→</span>
        </Link>
        <button
          className="premium-cart-button"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          style={{
            opacity: isAvailable ? 1 : 0.5,
            cursor: isAvailable ? "pointer" : "not-allowed",
          }}
        >
          <span>{isAvailable ? "Add +" : "Sold Out"}</span>
        </button>
      </div>
    </article>
  );
}
