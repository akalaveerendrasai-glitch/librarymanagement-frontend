import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export default function MyBorrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMyBorrowings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axiosClient.get('/borrowings/my');
      setBorrowings(response.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch your borrowing history from the server.';
      setError(msg);
      setBorrowings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBorrowings();
  }, [fetchMyBorrowings]);

  const handleReturn = async (borrowingId, bookTitle) => {
    const confirmReturn = window.confirm(
      `Confirm returning "${bookTitle || 'this book'}" to the library?`
    );
    if (!confirmReturn) return;

    setReturningId(borrowingId);
    setError('');
    setSuccess('');

    try {
      await axiosClient.put(`/borrowings/${borrowingId}/return`);
      setSuccess(`"${bookTitle || 'Book'}" has been successfully returned to library inventory!`);
      // Re-fetch to update status to RETURNED and capture returnDate
      fetchMyBorrowings();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to return book. This record may have already been returned.';
      setError(msg);
    } finally {
      setReturningId(null);
    }
  };

  const activeLoans = borrowings.filter((b) => b.status === 'BORROWED');
  const pastLoans = borrowings.filter((b) => b.status === 'RETURNED');

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          My Borrowed Books
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Manage your active student loans, monitor due dates, and check in returned titles.
        </p>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <LoadingSpinner message="Retrieving your loan records from database..." />
      ) : borrowings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <span style={{ fontSize: '3.5rem' }}>📚</span>
          <h3 style={{ marginTop: '0.75rem', fontWeight: 700, fontSize: '1.25rem' }}>
            You Have No Borrowed Books
          </h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '450px', margin: '0.25rem auto 1.5rem' }}>
            Explore the library catalog to find textbooks and academic references for your courses.
          </p>
          <Link to="/books" className="btn btn-primary">
            Browse Book Catalog
          </Link>
        </div>
      ) : (
        <>
          {/* Active Loans Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Active Loans
              </h2>
              <span className="badge badge-warning">
                {activeLoans.length} / 3 Allowed
              </span>
            </div>

            {activeLoans.length === 0 ? (
              <div className="card" style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>
                You have no active borrowings at this time.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title &amp; Author</th>
                      <th>ISBN</th>
                      <th>Issue Date</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLoans.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.book?.title}</strong>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            by {item.book?.author}
                          </div>
                        </td>
                        <td><code>{item.book?.isbn}</code></td>
                        <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                        <td style={{ color: 'var(--accent)', fontWeight: 700 }}>
                          {new Date(item.dueDate).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="badge badge-warning">BORROWED</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleReturn(item.id, item.book?.title)}
                            disabled={returningId === item.id}
                            className="btn btn-success btn-sm"
                          >
                            {returningId === item.id ? 'Checking In...' : 'Return Book'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Past Returned History Section */}
          {pastLoans.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-muted)' }}>
                Past Borrowing History ({pastLoans.length})
              </h2>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title &amp; Author</th>
                      <th>Issue Date</th>
                      <th>Return Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastLoans.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.book?.title}</strong>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            by {item.book?.author}
                          </div>
                        </td>
                        <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                        <td>
                          {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          <span className="badge badge-success">RETURNED</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
