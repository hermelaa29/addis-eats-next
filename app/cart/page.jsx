'use client';

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cartStore";
import { EmptyState } from "@/components/ui/States";
import { useRequireAuth } from "@/lib/useRequireAuth";
import gsap from "gsap";

export default function CartPage() {
  const { isReady } = useRequireAuth("/cart");
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());
  const increase = useCartStore((state) => state.increase);
  const decrease = useCartStore((state) => state.decrease);
  const removeItem = useCartStore((state) => state.removeItem);

  const pageRef = useRef(null);
  const deliveryFee = total >= 800 ? 0 : 80;
  const estimatedMinutes = 35 + items.length * 5;

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
      gsap.from(".cart-layout > *", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2,
      });
    }, pageRef);
    return () => ctx.revert();
  }, [isReady]);

  if (!isReady) return null;

  if (!items.length)
    return (
      <main className="page narrow" ref={pageRef}>
        <div className="page-intro">
          <p className="eyebrow">Your order</p>
          <h1>Your bag is light.</h1>
        </div>
        <div className="cart-layout">
          <EmptyState
            title="Nothing here yet"
            message="Your next favourite dish is waiting on the menu."
            action={
              <Link className="button button-dark" href="/menu">
                Browse the menu
              </Link>
            }
          />
        </div>
      </main>
    );

  return (
    <main className="page cart-page" ref={pageRef}>
      <div className="page-intro">
        <p className="eyebrow">Your order</p>
        <h1>Good choices.</h1>
        <p>Review your order before we send it your way.</p>
      </div>
      <div className="cart-layout">
        <section className="cart-lines" aria-label="Order items">
          {items.map(({ dish, quantity }) => (
            <article className="cart-line" key={dish.id}>
              <div
                className={`cart-thumb accent-${dish.accent}`}
                style={{ backgroundImage: `url(${dish.image})` }}
                aria-hidden="true"
              />
              <div className="cart-line-info">
                <h2>{dish.name}</h2>
                <p>{dish.price} ETB each</p>
                <div className="quantity">
                  <button
                    onClick={() => decrease(dish.id)}
                    aria-label={`Decrease ${dish.name}`}
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => increase(dish.id)}
                    aria-label={`Increase ${dish.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
              <strong>
                {dish.price * quantity} <small>ETB</small>
              </strong>
              <button
                className="remove-button"
                onClick={() => removeItem(dish.id)}
                aria-label={`Remove ${dish.name}`}
              >
                ×
              </button>
            </article>
          ))}
        </section>
        <aside className="summary">
          <p className="eyebrow">Order summary</p>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{total} ETB</strong>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <strong className={deliveryFee === 0 ? "free" : ""}>
              {deliveryFee === 0 ? "Free" : `${deliveryFee} ETB`}
            </strong>
          </div>
          <div className="summary-row">
            <span>Estimated time</span>
            <strong>{estimatedMinutes} min</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>
              {total + deliveryFee} <small>ETB</small>
            </strong>
          </div>
          <Link className="button button-dark full" href="/checkout">
            Continue to checkout <span>→</span>
          </Link>
          <p className="summary-note">
            Delivery across Addis Ababa. Pay on arrival.
          </p>
        </aside>
      </div>
    </main>
  );
}
