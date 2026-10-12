import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BookCard({ book, onBorrow }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Category Badge & Availability Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <span className="badge badge-info">{book.category}</span>
        <span className={`badge ${isAvailable ? 'badge-success' : 'badge-danger'}`}>
          {isAvailable ? `${book.availableCopies} Available` : 'Out of Stock'}
        </span>
      </div>

      {/* Book Title */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)', lineHeight: 1.3 }}>
        {book.title}
      </h3>

      {/* Author */}
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        by <strong>{book.author}</strong>
      </p>

      {/* ISBN and Stock Count Details */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--bg-subtle)',
        padding: '0.4rem 0.65rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '0.85rem'
      }}>
        <span>ISBN: <code>{book.isbn}</code></span>
        <span>Stock: <strong>{book.availableCopies} / {book.totalCopies}</strong></span>
      </div>

      {/* Book Description Preview */}
      <p style={{
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        flex: 1,
        marginBottom: '1.25rem',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        lineHeight: 1.6
      }}>
        {book.description || 'No description provided for this academic title.'}
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
        <Link to={`/books/${book.id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
          View Details
        </Link>

        {isAuthenticated && !isAdmin && (
          <button
            onClick={() => onBorrow && onBorrow(book.id)}
            disabled={!isAvailable}
            className={`btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            {isAvailable ? 'Borrow Copy' : 'Unavailable'}
          </button>
        )}
      </div>
    </div>
  );
}
