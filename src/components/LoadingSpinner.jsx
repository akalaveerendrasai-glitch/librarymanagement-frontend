export default function LoadingSpinner({ message = 'Loading library data...' }) {
  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
        {message}
      </p>
    </div>
  );
}
