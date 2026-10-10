'use client';

import { useEffect, useState, useRef } from "react";
import { useDishesStore } from "@/store/dishesStore";
import { useToastStore } from "@/store/toastStore";
import gsap from "gsap";

export default function AdminMenuPage() {
  const { dishes, fetchDishes, addDish, updateDish, removeDish } = useDishesStore();
  const showToast = useToastStore((state) => state.showToast);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const pageRef = useRef(null);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  useEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".admin-panel-heading > *, .admin-search", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });
      gsap.from(".admin-row", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "power3.out",
        delay: 0.2,
      });
    }, pageRef);
    return () => ctx.revert();
  }, [dishes.length]);

  const save = (dish) => {
    const isNew = !dishes.some((item) => item.id === dish.id);
    if (isNew) {
      addDish(dish);
      showToast("Dish successfully added to the menu");
    } else {
      updateDish(dish.id, dish);
      showToast("Dish successfully updated");
    }
    setEditing(null);
  };

  const remove = (dish) => {
    if (window.confirm(`Delete ${dish.name}?`)) {
      removeDish(dish.id);
      showToast("Dish deleted");
    }
  };

  const visible = (dishes || []).filter((dish) =>
    `${dish.name} ${dish.category}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <section className="admin-panel" ref={pageRef}>
      <div className="admin-panel-heading">
        <div>
          <p className="eyebrow">Menu management</p>
          <h2>Dishes</h2>
        </div>
        <button
          className="button button-dark"
          type="button"
          onClick={() =>
            setEditing({
              id: `AE-${Date.now()}`,
              name: "",
              category: "Ethiopian",
              price: "",
              description: "",
              image: "",
              tag: "New",
              available: true,
            })
          }
        >
          Add dish <span>+</span>
        </button>
      </div>
      <input
        className="admin-search"
        aria-label="Search dishes"
        placeholder="Search dishes by name or category..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {editing && (
        <DishForm
          dish={editing}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}

      <div className="admin-table">
        {visible.length === 0 && (
          <p className="admin-empty">No dishes found matching your search.</p>
        )}
        {visible.map((dish) => (
          <div className="admin-row" key={dish.id} style={{ gridTemplateColumns: "1fr auto auto" }}>
            <div className="admin-row-info">
              <strong>{dish.name}</strong>
              <span>
                {dish.category}
                {!dish.available && (
                  <strong
                    style={{
                      color: "var(--gold-dark)",
                      marginLeft: "8px",
                      display: "inline-block",
                      background: "var(--soft-gold)",
                      padding: "2px 8px",
                      borderRadius: "99px",
                      fontSize: "9px",
                    }}
                  >
                    SOLD OUT
                  </strong>
                )}
              </span>
            </div>
            <b>
              {dish.price} <small>ETB</small>
            </b>
            <div className="admin-row-actions">
              <button
                className="button button-light"
                type="button"
                onClick={() => setEditing(dish)}
              >
                Edit
              </button>
              <button
                className="button button-light"
                type="button"
                style={{ color: "red" }}
                onClick={() => remove(dish)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DishForm({ dish, onCancel, onSave }) {
  const [form, setForm] = useState(dish);
  const modalRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(
      modalRef.current.querySelector(".admin-modal-content"),
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", delay: 0.1 }
    );
  }, []);

  const update = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: key === "price" ? Number(value) : value,
    }));

  return (
    <div
      className="admin-modal-overlay"
      ref={modalRef}
      onClick={(e) => {
        if (e.target === modalRef.current) onCancel();
      }}
    >
      <form
        className="admin-modal-content checkout-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "24px",
            font: "400 32px var(--serif)",
          }}
        >
          {dish.name ? "Edit Dish" : "Add New Dish"}
        </h2>
        <label>
          Dish Name
          <input
            required
            placeholder="e.g. Shiro Wot"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <label>
            Category
            <input
              required
              placeholder="e.g. Ethiopian"
              value={form.category}
              onChange={(event) => update("category", event.target.value)}
            />
          </label>
          <label>
            Price (ETB)
            <input
              required
              type="number"
              min="0"
              placeholder="e.g. 250"
              value={form.price}
              onChange={(event) => update("price", event.target.value)}
            />
          </label>
        </div>
        <label>
          Description
          <textarea
            required
            placeholder="Describe the ingredients and flavors..."
            rows={3}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
          />
        </label>
        <label
          className="admin-checkbox-label"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
            margin: "24px 0",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.available !== false}
            onChange={(event) => update("available", event.target.checked)}
            style={{ width: "20px", height: "20px", accentColor: "var(--gold)" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <strong style={{ fontSize: "14px", color: "var(--ink)" }}>
              Available for Order
            </strong>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              Uncheck this to mark the dish as Sold Out
            </span>
          </div>
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
            marginTop: "10px",
          }}
        >
          <button className="button button-light" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="button button-dark">
            Save Dish <span>→</span>
          </button>
        </div>
      </form>
    </div>
  );
}
