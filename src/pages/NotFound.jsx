import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <span style={{ fontSize: '4.5rem' }}>🧭</span>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '1rem', color: 'var(--text-main)' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '500px', margin: '0.75rem auto 2rem' }}>
        The library page or resource you are looking for does not exist or has been moved to another aisle.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        Return to Home Page
      </Link>
    </div>
  );
}
