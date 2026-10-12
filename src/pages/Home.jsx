import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedBooks();
  }, []);

  const fetchFeaturedBooks = async () => {
    try {
      const response = await axiosClient.get('/books', {
        params: { page: 0, size: 3, sortBy: 'id', sortDir: 'asc' },
      });
      setFeaturedBooks(response.data?.content || []);
    } catch (err) {
      setFeaturedBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/books');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '3.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '2.5rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block',
            padding: '0.35rem 0.85rem',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1rem',
            backdropFilter: 'blur(4px)'
          }}>
            🏛️ Campus Library Management System
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
            Discover, Borrow &amp; Explore Academic Resources
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#cbd5e1', marginBottom: '2rem' }}>
            Browse hundreds of textbooks, computer science manuals, and academic references. Check availability in real-time and manage your borrowing history.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', maxWidth: '580px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Search by book title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{
                fontSize: '1rem',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: 'none'
              }}
            />
            <button type="submit" className="btn btn-accent btn-lg" style={{ whiteSpace: 'nowrap' }}>
              Search Catalog
            </button>
          </form>
        </div>
      </section>

      {/* Quick Stats / Info Cards */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="grid grid-cols-3">
          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📖</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Comprehensive Catalog</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Access books across Computer Science, Software Engineering, Mathematics, and more.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Instant Self-Checkout</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Logged-in members can borrow available books immediately and return them anytime.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Librarian Controls</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Authorized administrators can add books, update copy counts, and track lending circulation.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Books Section from Live API */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>Featured Titles</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Popular academic titles currently in library stock</p>
          </div>
          <Link to="/books" className="btn btn-outline btn-sm">
            View All Catalog Books &rarr;
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading featured titles..." />
        ) : featuredBooks.length > 0 ? (
          <div className="grid grid-cols-3">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <p>Connect your Spring Boot backend to populate featured catalog books from MySQL.</p>
            <Link to="/books" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
              Browse Catalog Page
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
