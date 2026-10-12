import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export default function BookCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  // Catalog State
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search State
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  // Pagination State matching Backend PagedResponse
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLastPage, setIsLastPage] = useState(true);

  /**
   * Fetch books from Spring Boot REST API
   * Uses GET /api/books/search when query is provided, else GET /api/books
   */
  const fetchBooks = useCallback(async (query = '', pageNumber = 0, size = 6) => {
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

      // Map backend PagedResponse fields
      setBooks(pagedData.content || []);
      setCurrentPage(pagedData.pageNumber || 0);
      setPageSize(pagedData.pageSize || size);
      setTotalPages(pagedData.totalPages || 0);
      setTotalElements(pagedData.totalElements || 0);
      setIsLastPage(Boolean(pagedData.lastPage));
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Failed to connect to the backend API. Please make sure the Spring Boot server is running on http://localhost:8080.';
      setError(message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on initial render and when active search or page changes
  useEffect(() => {
    fetchBooks(activeQuery, currentPage, pageSize);
  }, [fetchBooks, activeQuery, currentPage, pageSize]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    setActiveQuery(trimmed);
    setCurrentPage(0); // Reset to page 0 on new search

    if (trimmed) {
      setSearchParams({ search: trimmed });
    } else {
      setSearchParams({});
    }
  };

  // Reset Search Filter
  const handleResetSearch = () => {
    setSearchInput('');
    setActiveQuery('');
    setCurrentPage(0);
    setSearchParams({});
  };

  // Borrow Book and immediately refresh stock count
  const handleBorrow = async (bookId) => {
    setError('');
    setSuccessMessage('');

    try {
      await axiosClient.post(`/borrowings/issue/${bookId}`);
      setSuccessMessage('Book issued successfully! Stock count updated.');
      // Refresh current page to get accurate availableCopies directly from MySQL
      fetchBooks(activeQuery, currentPage, pageSize);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        'Could not issue book. You may have reached the maximum allowed borrowings or this title is out of stock.';
      setError(errMsg);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Library Book Catalog
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Real-time catalog synchronized with MySQL database
        </p>
      </div>

      {/* User Alerts */}
      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />

      {/* Search & Page Size Toolbar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 340px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by book title or author..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Search
            </button>
            {activeQuery && (
              <button type="button" onClick={handleResetSearch} className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
                Clear
              </button>
            )}
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <label htmlFor="sizeSelect" style={{ fontWeight: 600 }}>Items per page:</label>
            <select
              id="sizeSelect"
              className="form-control"
              style={{ width: 'auto', padding: '0.45rem 0.75rem' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
            >
              <option value={3}>3 per page</option>
              <option value={6}>6 per page</option>
              <option value={12}>12 per page</option>
            </select>
          </div>
        </div>

        {/* Active Query Status Indicator */}
        {activeQuery && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing search results for: <strong>"{activeQuery}"</strong> ({totalElements} matching titles found)
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner message="Fetching live catalog from MySQL database..." />
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <h3 style={{ marginTop: '0.5rem', fontWeight: 700, color: 'var(--danger)' }}>
            Database Connection Error
          </h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '500px', margin: '0.25rem auto 1.5rem' }}>
            {error}
          </p>
          <button onClick={() => fetchBooks(activeQuery, currentPage, pageSize)} className="btn btn-primary">
            Retry Connection
          </button>
        </div>
      ) : books.length === 0 ? (
        /* Empty State */
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <span style={{ fontSize: '3.5rem' }}>📭</span>
          <h3 style={{ marginTop: '0.75rem', fontWeight: 700, fontSize: '1.25rem' }}>
            No Books Found in Catalog
          </h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '450px', margin: '0.25rem auto 1.25rem' }}>
            {activeQuery
              ? `No cataloged books matched your search query "${activeQuery}".`
              : 'There are currently no books stored in the library database.'}
          </p>
          {activeQuery && (
            <button onClick={handleResetSearch} className="btn btn-outline btn-sm">
              View All Catalog Books
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Books Grid */}
          <div className="grid grid-cols-3" style={{ marginBottom: '2.5rem' }}>
            {books.map((book) => (
              <BookCard key={book.id} book={book} onBorrow={handleBorrow} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Showing page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} total books)
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="btn btn-outline btn-sm"
                >
                  &larr; Previous Page
                </button>

                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={isLastPage || currentPage >= totalPages - 1}
                  className="btn btn-outline btn-sm"
                >
                  Next Page &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
