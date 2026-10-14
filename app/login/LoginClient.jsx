'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import gsap from "gsap";

import { loginAction } from "@/app/actions/auth";
import { validateRedirect } from "@/lib/utils";

export default function LoginClient() {
  const user = useAuthStore((state) => state.user);
  const signIn = useAuthStore((state) => state.signIn);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [touched, setTouched] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pageRef = useRef(null);

  useEffect(() => {
    if (!mounted || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".auth-card > *", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, pageRef);
    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) return null;

  if (user)
    return (
      <main className="page narrow" ref={pageRef}>
        <div className="state state-empty auth-card">
          <h1>You are already signed in</h1>
          <p>Welcome back, {user.name}.</p>
          <Link
            className="button button-dark"
            href={user.isAdmin ? "/admin" : returnTo}
          >
            Continue
          </Link>
        </div>
      </main>
    );

  const submit = async (event) => {
    event.preventDefault();
    setTouched(true);

    if (
      !form.name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ||
      !form.password.trim()
    ) {
      return;
    }

    const isAdmin = form.email.trim() === "admin@gmail.com";
    const res = await loginAction(form.email.trim(), form.password, isAdmin);
    
    if (res.success) {
      const actuallyIsAdmin = signIn(form.name.trim(), form.email, form.password);
      const safeUrl = validateRedirect(returnTo, "/");
      router.replace(actuallyIsAdmin ? "/admin" : safeUrl);
    } else {
      alert(res.error || "Login failed");
    }
  };

  return (
    <main className="page auth-page" ref={pageRef}>
      <div className="auth-card">
        <p className="eyebrow">Welcome to the table</p>
        <h1>Sign in to continue.</h1>
        <p>
          Use your name, email, and password. Admins can sign in here to open
          the dashboard.
        </p>
        <div className="demo-credentials">
          <p className="eyebrow" style={{ marginBottom: 8, opacity: 0.6 }}>Demo accounts</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="button button-outline"
              style={{ fontSize: 13, padding: "6px 14px" }}
              onClick={() =>
                setForm({ name: "Hana Bekele", email: "hana@example.com", password: "password123" })
              }
            >
              👤 Customer — hana@example.com / password123
            </button>
            <button
              type="button"
              className="button button-outline"
              style={{ fontSize: 13, padding: "6px 14px" }}
              onClick={() =>
                setForm({ name: "Admin", email: "admin@gmail.com", password: "admin" })
              }
            >
              🛠 Admin — admin@gmail.com / admin
            </button>
          </div>
        </div>
        <form onSubmit={submit} noValidate>
          <label>
            Full name
            <input
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              onBlur={() => setTouched(true)}
              placeholder="e.g. Hana Bekele"
            />
            {touched && !form.name.trim() && (
              <small className="field-error">Please enter your name.</small>
            )}
          </label>
          <label>
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              onBlur={() => setTouched(true)}
              placeholder="you@example.com"
            />
            {touched &&
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                <small className="field-error">
                  Enter a valid email address.
                </small>
              )}
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              onBlur={() => setTouched(true)}
              placeholder="Enter your password"
            />
            {touched && !form.password.trim() && (
              <small className="field-error">
                Please enter your password.
              </small>
            )}
          </label>
          <button className="button button-dark full" type="submit">
            Sign in <span>→</span>
          </button>
        </form>
        <Link className="back-link" href="/">
          ← Return home
        </Link>
      </div>
    </main>
  );
}
