'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/store/adminAuthStore";

import { loginAction } from "@/app/actions/auth";

export default function AdminLoginClient() {
  const admin = useAdminAuthStore((state) => state.admin);
  const signIn = useAdminAuthStore((state) => state.signIn);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const returnTo = searchParams.get("returnTo") || "/admin";

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (admin)
    return (
      <main className="page narrow">
        <div className="state state-empty">
          <span className="state-mark">✓</span>
          <h1>Admin access is active.</h1>
          <p>Continue to the Addis Eats control room.</p>
          <Link className="button button-dark" href="/admin">
            Open dashboard
          </Link>
        </div>
      </main>
    );

  const submit = async (event) => {
    event.preventDefault();
    const res = await loginAction(form.email.trim(), form.password, true);
    if (!res.success) {
      setError("Incorrect admin username or password.");
      return;
    }
    // Set client state
    signIn(form.email.trim(), form.password);
    router.replace(returnTo);
  };

  return (
    <main className="page auth-page">
      <div className="auth-card admin-auth-card">
        <p className="eyebrow">Addis Eats control room</p>
        <h1>Admin sign in.</h1>
        <p>Manage the restaurant experience from one quiet place.</p>
        <form onSubmit={submit} noValidate>
          <label>
            Admin email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              autoComplete="username"
              placeholder="admin@gmail.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              autoComplete="current-password"
              placeholder="Enter password"
            />
          </label>
          {error && (
            <small className="field-error" role="alert">
              {error}
            </small>
          )}
          <button className="button button-dark full" type="submit">
            Enter dashboard <span>→</span>
          </button>
        </form>
        <Link className="back-link" href="/">
          ← Return to storefront
        </Link>
      </div>
    </main>
  );
}
