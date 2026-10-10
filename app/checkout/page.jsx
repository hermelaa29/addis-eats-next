'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useOrdersStore } from "@/store/ordersStore";
import { useRequireAuth } from "@/lib/useRequireAuth";
import gsap from "gsap";

const initialForm = { name: "", phone: "", address: "", note: "" };

function validate(form) {
  return {
    name: form.name.trim().length < 2 ? "Please enter your full name." : "",
    phone: !/^\+?[0-9\s-]{9,}$/.test(form.phone)
      ? "Enter a valid phone number."
      : "",
    address:
      form.address.trim().length < 8
        ? "Please enter a complete delivery address (e.g., Bole, Wolo Sefer, House #123)."
        : "",
  };
}

export default function CheckoutPage() {
  const { isReady } = useRequireAuth("/checkout");
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrdersStore((state) => state.addOrder);

  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle");

  const pageRef = useRef(null);

  useEffect(() => {
    if (!isReady || !pageRef.current || status === "success" || !items.length) return;
    const ctx = gsap.context(() => {
      gsap.from(".page-intro > *", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
      });
      gsap.from(".checkout-layout > *", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2,
      });
    }, pageRef);
    return () => ctx.revert();
  }, [isReady, status, items.length]);

  useEffect(() => {
    if (isReady && status === "success" && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".success-card > *", {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        });
      }, pageRef);
      return () => ctx.revert();
    }
  }, [isReady, status]);

  if (!isReady) return null;

  const errors = validate(form);
  const deliveryFee = total >= 800 ? 0 : 80;
  const estimatedMinutes = 35 + items.length * 5;

  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setTouched({ name: true, phone: true, address: true });
    if (Object.values(errors).some(Boolean) || !items.length) return;

    setStatus("submitting");
    await new Promise((resolve) => setTimeout(resolve, 900));

    addOrder({
      customer: {
        name: form.name.trim(),
        phone: form.phone,
        address: form.address,
        note: form.note,
      },
      items: items.map(({ dish, quantity }) => ({ dish, quantity })),
      total: total + deliveryFee,
      deliveryFee,
      estimatedMinutes,
    });

    setStatus("success");
    clearCart();
  };

  if (status === "success")
    return (
      <main className="page narrow" ref={pageRef}>
        <div className="success-card">
          <span className="success-icon">✓</span>
          <p className="eyebrow">Order received</p>
          <h1>Thank you, {form.name.split(" ")[0]}.</h1>
          <p>
            Your order is being prepared with care. We will bring it to{" "}
            <strong>{form.address}</strong> soon.
          </p>
          <Link className="button button-dark" href="/menu">
            Order something else
          </Link>
        </div>
      </main>
    );

  if (!items.length)
    return (
      <main className="page narrow">
        <div className="state state-empty">
          <h1>Your bag is empty.</h1>
          <p>Add something delicious before coming to checkout.</p>
          <Link className="button button-dark" href="/menu">
            Browse the menu
          </Link>
        </div>
      </main>
    );

  return (
    <main className="page checkout-page" ref={pageRef}>
      <div className="page-intro">
        <p className="eyebrow">Almost there</p>
        <h1>Where should we bring it?</h1>
        <p>We deliver across Addis Ababa. Payment is made on arrival.</p>
      </div>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit} noValidate>
          <Field
            label="Full name"
            name="name"
            value={form.name}
            onChange={update}
            onBlur={() => setTouched({ ...touched, name: true })}
            error={touched.name && errors.name}
            placeholder="Your name"
          />
          <Field
            label="Phone number"
            name="phone"
            value={form.phone}
            onChange={update}
            onBlur={() => setTouched({ ...touched, phone: true })}
            error={touched.phone && errors.phone}
            placeholder="09 00 00 00 00"
          />
          <Field
            label="Delivery address"
            name="address"
            value={form.address}
            onChange={update}
            onBlur={() => setTouched({ ...touched, address: true })}
            error={touched.address && errors.address}
            placeholder="e.g., Bole, Wolo Sefer, House #123"
          />
          <label>
            Note <span className="optional">Optional</span>
            <textarea
              value={form.note}
              onChange={(event) => update("note", event.target.value)}
              placeholder="Anything we should know?"
              rows="3"
            />
          </label>
          <button
            className="button button-dark full"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Placing your order..." : "Place order"}{" "}
            <span>→</span>
          </button>
        </form>
        <aside className="summary checkout-summary">
          <p className="eyebrow">Your order</p>
          {items.map(({ dish, quantity }) => (
            <div className="summary-row" key={dish.id}>
              <span>
                {quantity} × {dish.name}
              </span>
              <strong>{dish.price * quantity} ETB</strong>
            </div>
          ))}
          <div className="summary-total">
            <span>Total</span>
            <strong>
              {total + deliveryFee} <small>ETB</small>
            </strong>
          </div>
          <p className="summary-note">
            Estimated delivery: {estimatedMinutes} minutes.
          </p>
        </aside>
      </div>
    </main>
  );
}

function Field({ label, name, value, onChange, onBlur, error, placeholder }) {
  return (
    <label>
      {label}
      <input
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
      />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
