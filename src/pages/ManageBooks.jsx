import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search and Pagination State
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLastPage, setIsLastPage] = useState(true);

  const fetchAdminBooks = useCallback(async (query = '', pageNumber = 0, size = 10) => {
    setLoading(true);
    setError('');

    try {
      const isSearch = Boolean(query && query.trim());
      const endpoint = isSearch ? '/books/search' : '/books';

      const params = {
        page: pageNumber,
        size: size,
        sortBy: 'id',
        sortDir: 'asc',
      };

      if (isSearch) {
        params.query = query.trim();
      }

      const response = await axiosClient.get(endpoint, { params });
      const pagedData = response.data;

      setBooks(pagedData.content || []);
      setCurrentPage(pagedData.pageNumber || 0);
      setPageSize(pagedData.pageSize || size);
      setTotalPages(pagedData.totalPages || 0);
      setTotalElements(pagedData.totalElements || 0);
      setIsLastPage(Boolean(pagedData.lastPage));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to retrieve catalog books from server.';
      setError(msg);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminBooks(activeQuery, currentPage, pageSize);
  }, [fetchAdminBooks, activeQuery, currentPage, pageSize]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveQuery(searchInput.trim());
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveQuery('');
    setCurrentPage(0);
  };

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}" (ID: #${id})?\n\nThis will remove the book permanently from the catalog.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    setError('');
    setSuccess('');

    try {
      await axiosClient.delete(`/books/${id}`);
      setSuccess(`Book "${title}" was successfully deleted from the library.`);
      // Refresh list to update counts and pages
      fetchAdminBooks(activeQuery, currentPage, pageSize);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        `Cannot delete book #${id}. It may have active borrowings or you may lack administrative privileges.`;
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Manage Book Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Administrative inventory controls: Add, edit copy counts, or remove cataloged titles.
          </p>
        </div>

        <Link to="/admin/books/new" className="btn btn-primary">
          + Add New Book
        </Link>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, author, or keyword..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ flex: '1 1 280px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            Filter Catalog
          </button>
          {activeQuery && (
            <button type="button" onClick={handleClearSearch} className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
              Clear Filter
            </button>
          )}
        </form>
      </div>

      {/* Main Table / Loading */}
      {loading ? (
        <LoadingSpinner message="Loading catalog records..." />
      ) : books.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <span style={{ fontSize: '3rem' }}>📭</span>
          <h3 style={{ marginTop: '0.75rem', fontWeight: 700 }}>No Books Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {activeQuery ? `No titles matched "${activeQuery}".` : 'No books currently cataloged in database.'}
          </p>
          <Link to="/admin/books/new" className="btn btn-primary btn-sm" style={{ marginTop: '1.25rem' }}>
            Add Your First Book
          </Link>
        </div>
      ) : (
        <>
          <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title &amp; Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Available / Total Copies</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.id}>
                    <td><strong>#{b.id}</strong></td>
                    <td>
                      <strong>{b.title}</strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>by {b.author}</div>
                    </td>
                    <td><code>{b.isbn}</code></td>
                    <td><span className="badge badge-info">{b.category}</span></td>
                    <td>
                      <span style={{ fontWeight: 700, color: b.availableCopies > 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {b.availableCopies}
                      </span>{' '}
                      / {b.totalCopies}
                    </td>
                    <td>
                      <span className={`badge ${b.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {b.availableCopies > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Link
                        to={`/admin/books/edit/${b.id}`}
                        className="btn btn-outline btn-sm"
                        style={{ marginRight: '0.5rem' }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(b.id, b.title)}
                        disabled={deletingId === b.id}
                        className="btn btn-danger btn-sm"
                      >
                        {deletingId === b.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1.25rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              fontSize: '0.9rem'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} total books)
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="btn btn-outline btn-sm"
                >
                  &larr; Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={isLastPage || currentPage >= totalPages - 1}
                  className="btn btn-outline btn-sm"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
