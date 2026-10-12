import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCopies: 0,
    availableCopies: 0,
    borrowedCopies: 0,
    outOfStock: 0,
    recentBooks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch books from backend (size=100 to compute aggregate inventory statistics)
      const response = await axiosClient.get('/books', {
        params: { page: 0, size: 100, sortBy: 'id', sortDir: 'desc' },
      });

      const pagedData = response.data;
      const booksList = pagedData.content || [];

      // Calculate summary metrics directly from live MySQL data
      const totalBooks = pagedData.totalElements || booksList.length;
      const totalCopies = booksList.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
      const availableCopies = booksList.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
      const borrowedCopies = Math.max(0, totalCopies - availableCopies);
      const outOfStock = booksList.filter((b) => b.availableCopies === 0).length;

      setStats({
        totalBooks,
        totalCopies,
        availableCopies,
        borrowedCopies,
        outOfStock,
        recentBooks: booksList.slice(0, 5),
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not connect to backend to load dashboard metrics.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Title & Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Librarian Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Live library inventory and catalog analytics from MySQL
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/books/new" className="btn btn-primary">
            + Add New Book
          </Link>
          <Link to="/admin/books" className="btn btn-outline">
            Full Catalog Table
          </Link>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {loading ? (
        <LoadingSpinner message="Calculating inventory statistics from database..." />
      ) : (
        <>
          {/* KPI Analytics Cards */}
          <div className="grid grid-cols-4" style={{ marginBottom: '2.5rem' }}>
            <div className="card">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Unique Titles
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
                {stats.totalBooks}
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Registered book titles</span>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Copies
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                {stats.totalCopies}
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total physical inventory</span>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Available Copies
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>
                {stats.availableCopies}
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Ready for student borrowing</span>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Currently Borrowed
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.25rem' }}>
                {stats.borrowedCopies}
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Copies out with students</span>
            </div>
          </div>

          {/* Recent Catalog Activity */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recently Cataloged Books</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latest additions to the academic library</p>
              </div>
              <Link to="/admin/books" className="btn btn-outline btn-sm">
                View All &rarr;
              </Link>
            </div>

            {stats.recentBooks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No books registered yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title &amp; Author</th>
                      <th>ISBN</th>
                      <th>Category</th>
                      <th>Stock (Avail / Total)</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBooks.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong>{b.title}</strong>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>by {b.author}</div>
                        </td>
                        <td><code>{b.isbn}</code></td>
                        <td><span className="badge badge-info">{b.category}</span></td>
                        <td>
                          <span style={{ fontWeight: 700, color: b.availableCopies > 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {b.availableCopies}
                          </span> / {b.totalCopies}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link to={`/admin/books/edit/${b.id}`} className="btn btn-outline btn-sm">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
