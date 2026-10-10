import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page narrow">
      <div className="state state-empty">
        <span className="state-mark">404</span>
        <h1>That page took a wrong turn.</h1>
        <p>Let us get you back to something delicious.</p>
        <div className="inline-actions">
          <Link className="button button-dark" href="/">
            Home
          </Link>
          <Link className="button button-light" href="/menu">
            Menu
          </Link>
        </div>
      </div>
    </main>
  );
}
