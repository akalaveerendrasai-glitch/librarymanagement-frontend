import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BookForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // Controlled Form State
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    totalCopies: 1,
    availableCopies: 1,
    description: '',
  });

  // Track original values in edit mode to calculate borrowed copies
  const [originalBook, setOriginalBook] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [fetching, setFetching] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadBookForEditing();
    }
  }, [id]);

  const loadBookForEditing = async () => {
    setFetching(true);
    setServerError('');

    try {
      const response = await axiosClient.get(`/books/${id}`);
      const book = response.data;
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        category: book.category || '',
        totalCopies: book.totalCopies ?? 1,
        availableCopies: book.availableCopies ?? 1,
        description: book.description || '',
      });
      setOriginalBook(book);
    } catch (err) {
      const msg = err.response?.data?.message || `Could not find book record #${id} to edit.`;
      setServerError(msg);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalCopies' || name === 'availableCopies' ? Number(value) : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  // Client-Side Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = 'Title is required.';
    if (!formData.author.trim()) errors.author = 'Author is required.';
    if (!formData.isbn.trim()) errors.isbn = 'ISBN is required.';
    if (!formData.category.trim()) errors.category = 'Category is required.';

    if (formData.totalCopies < 0) {
      errors.totalCopies = 'Total copies cannot be negative.';
    }

    if (formData.availableCopies < 0) {
      errors.availableCopies = 'Available copies cannot be negative.';
    }

    if (formData.availableCopies > formData.totalCopies) {
      errors.availableCopies = `Available copies (${formData.availableCopies}) cannot exceed total copies (${formData.totalCopies}).`;
    }

    // Active borrowings constraint check during Edit
    if (isEditMode && originalBook) {
      const currentlyBorrowed = Math.max(0, originalBook.totalCopies - originalBook.availableCopies);

      if (formData.totalCopies < currentlyBorrowed) {
        errors.totalCopies = `Total copies cannot be lower than ${currentlyBorrowed} (the number of copies currently checked out by students).`;
      }

      const maxAllowableAvailable = formData.totalCopies - currentlyBorrowed;
      if (formData.availableCopies > maxAllowableAvailable) {
        errors.availableCopies = `Available copies cannot exceed ${maxAllowableAvailable} because ${currentlyBorrowed} copies are currently borrowed.`;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      if (isEditMode) {
        await axiosClient.put(`/books/${id}`, formData);
      } else {
        await axiosClient.post('/books', formData);
      }

      // Navigate back to Admin Manage Books table
      navigate('/admin/books');
    } catch (err) {
      if (err.response?.data?.validationErrors) {
        setFieldErrors(err.response.data.validationErrors);
      }
      const serverMsg =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? 'A book with this ISBN already exists in the library catalog.'
          : 'Failed to save book changes. Please verify all inputs.');
      setServerError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return <LoadingSpinner message="Loading book metadata from database..." />;
  }

  // Calculate currently checked out copies for helper badge
  const activeLoansCount = originalBook
    ? Math.max(0, originalBook.totalCopies - originalBook.availableCopies)
    : 0;

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {isEditMode ? 'Edit Book Record' : 'Add New Book to Catalog'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {isEditMode
              ? `Updating database record #${id}`
              : 'Enter book details and copy quantities to catalog a new title'}
          </p>
        </div>

        <Link to="/admin/books" className="btn btn-outline btn-sm">
          Cancel &amp; Return
        </Link>
      </div>

      <div className="card">
        <Alert type="error" message={serverError} onClose={() => setServerError('')} />

        {isEditMode && activeLoansCount > 0 && (
          <div style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--accent-light)',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            color: 'var(--accent-hover)'
          }}>
            ℹ️ <strong>Active Circulation Notice:</strong> {activeLoansCount} copy/copies of this book are currently borrowed by students. Total copies cannot be reduced below this number.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">Book Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-control"
              placeholder="e.g., Clean Architecture"
              value={formData.title}
              onChange={handleChange}
              style={fieldErrors.title ? { borderColor: 'var(--danger)' } : {}}
              disabled={submitting}
              required
            />
            {fieldErrors.title && <div className="form-error">{fieldErrors.title}</div>}
          </div>

          {/* Author & ISBN Grid */}
          <div className="grid grid-cols-2" style={{ marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" htmlFor="author">Author(s) *</label>
              <input
                id="author"
                name="author"
                type="text"
                className="form-control"
                placeholder="e.g., Robert C. Martin"
                value={formData.author}
                onChange={handleChange}
                style={fieldErrors.author ? { borderColor: 'var(--danger)' } : {}}
                disabled={submitting}
                required
              />
              {fieldErrors.author && <div className="form-error">{fieldErrors.author}</div>}
            </div>

            <div>
              <label className="form-label" htmlFor="isbn">ISBN (Unique) *</label>
              <input
                id="isbn"
                name="isbn"
                type="text"
                className="form-control"
                placeholder="e.g., 9780134494166"
                value={formData.isbn}
                onChange={handleChange}
                style={fieldErrors.isbn ? { borderColor: 'var(--danger)' } : {}}
                disabled={submitting}
                required
              />
              {fieldErrors.isbn && <div className="form-error">{fieldErrors.isbn}</div>}
            </div>
          </div>

          {/* Category, Total Copies & Available Copies Grid */}
          <div className="grid grid-cols-3" style={{ marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" htmlFor="category">Category *</label>
              <input
                id="category"
                name="category"
                type="text"
                className="form-control"
                placeholder="e.g., Software Engineering"
                value={formData.category}
                onChange={handleChange}
                style={fieldErrors.category ? { borderColor: 'var(--danger)' } : {}}
                disabled={submitting}
                required
              />
              {fieldErrors.category && <div className="form-error">{fieldErrors.category}</div>}
            </div>

            <div>
              <label className="form-label" htmlFor="totalCopies">Total Copies *</label>
              <input
                id="totalCopies"
                name="totalCopies"
                type="number"
                min="0"
                className="form-control"
                value={formData.totalCopies}
                onChange={handleChange}
                style={fieldErrors.totalCopies ? { borderColor: 'var(--danger)' } : {}}
                disabled={submitting}
                required
              />
              {fieldErrors.totalCopies && <div className="form-error">{fieldErrors.totalCopies}</div>}
            </div>

            <div>
              <label className="form-label" htmlFor="availableCopies">Available Copies *</label>
              <input
                id="availableCopies"
                name="availableCopies"
                type="number"
                min="0"
                className="form-control"
                value={formData.availableCopies}
                onChange={handleChange}
                style={fieldErrors.availableCopies ? { borderColor: 'var(--danger)' } : {}}
                disabled={submitting}
                required
              />
              {fieldErrors.availableCopies && <div className="form-error">{fieldErrors.availableCopies}</div>}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">Book Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows="4"
              placeholder="Summary of topics, chapters, academic prerequisites..."
              value={formData.description}
              onChange={handleChange}
              disabled={submitting}
            ></textarea>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ flex: 1 }}>
              {submitting
                ? 'Saving to Database...'
                : isEditMode
                ? 'Update Book Record'
                : 'Save Book to Catalog'}
            </button>
            <Link to="/admin/books" className="btn btn-outline btn-lg">
              Discard Changes
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
