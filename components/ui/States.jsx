export function Spinner({ label = "Loading" }) {
  return (
    <div className="state state-loading" role="status">
      <span className="spinner" />
      {label}...
    </div>
  );
}
export function EmptyState({ title, message, action }) {
  return (
    <div className="state state-empty">
      <span className="state-mark">✦</span>
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </div>
  );
}
export function ErrorMessage({ onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <span className="state-mark">!</span>
      <h2>Something went wrong</h2>
      <p>
        We could not load that right now. Please check your connection and try
        again.
      </p>
      {onRetry && (
        <button className="button button-dark" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
