import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="page narrow">
      <div className="state state-empty">
        <span className="state-mark">🔒</span>
        <h1>Access Not Allowed</h1>
        <p>
          You are currently signed in as a customer. This area is restricted to staff members only.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
          <Link className="button button-dark" href="/">
            Return home
          </Link>
          <Link className="button button-outline" href="/menu">
            View menu
          </Link>
          <Link className="button button-outline" href="/login">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
