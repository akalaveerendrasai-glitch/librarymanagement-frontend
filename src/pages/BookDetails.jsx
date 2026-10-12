import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [borrowing, setBorrowing] = useState(false);

  /**
   * Fetch live book details from Spring Boot backend (GET /api/books/:id)
   */
  const fetchBookDetails = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axiosClient.get(`/books/${id}`);
      setBook(response.data);
    } catch (err) {
      const msg =
        err.response?.status === 404
          ? `Book with ID #${id} does not exist in the database.`
          : err.response?.data?.message || 'Failed to retrieve book details from server.';
      setError(msg);
      setBook(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  /**
   * Issue book to the current logged-in user
   */
  const handleBorrow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setBorrowing(true);
    setError('');
    setSuccess('');

    try {
      await axiosClient.post(`/borrowings/issue/${id}`);
      setSuccess('Book borrowed successfully! Your borrowing record has been saved.');
      // Immediately re-fetch book details to update available copies in real time
      fetchBookDetails();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'Unable to borrow book. You may have reached your maximum active borrowings (3 books) or this title is out of stock.';
      setError(errorMsg);
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching book details from database..." />;
  }

  if (error && !book) {
    return (
      <div className="card" style={{ maxWidth: '650px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <Alert type="error" message={error} />
        <Link to="/books" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  const isAvailable = book?.availableCopies > 0;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <Link to="/books" className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem' }}>
        &larr; Back to Catalog
      </Link>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="card">
        {/* Header Information */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>{book.category}</span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {book.title}
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Written by <strong>{book.author}</strong>
            </p>
          </div>

          <span
            className={`badge ${isAvailable ? 'badge-success' : 'badge-danger'}`}
            style={{ fontSize: '0.9rem', padding: '0.4rem 0.85rem' }}
          >
            {isAvailable ? `${book.availableCopies} Copies Available` : 'Currently Out of Stock'}
          </span>
        </div>

        {/* Metadata Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          border: '1px solid var(--border)'
        }}>
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ISBN</p>
            <p style={{ fontWeight: 700, fontSize: '1rem' }}><code>{book.isbn}</code></p>
          </div>
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Available Copies</p>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: isAvailable ? 'var(--success)' : 'var(--danger)' }}>
              {book.availableCopies}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Copies</p>
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{book.totalCopies}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Database Record ID</p>
            <p style={{ fontWeight: 700, fontSize: '1rem' }}>#{book.id}</p>
          </div>
        </div>

        {/* Description Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Book Description</h3>
          <p style={{ color: 'var(--text-main)', lineHeight: 1.8, fontSize: '1rem' }}>
            {book.description || 'No detailed description cataloged for this academic book.'}
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', alignItems: 'center' }}>
          {isAuthenticated && !isAdmin ? (
            <button
              onClick={handleBorrow}
              disabled={!isAvailable || borrowing}
              className={`btn btn-lg ${isAvailable ? 'btn-primary' : 'btn-outline'}`}
              style={{ minWidth: '190px' }}
            >
              {borrowing ? 'Processing Loan...' : isAvailable ? 'Borrow This Book' : 'Out of Stock'}
            </button>
          ) : !isAuthenticated ? (
            <Link to="/login" className="btn btn-primary btn-lg">
              Sign In to Borrow Book
            </Link>
          ) : (
            <span className="badge badge-warning" style={{ fontSize: '0.85rem' }}>
              ℹ️ Logged in as Administrator (Book borrowing is restricted to student accounts)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
