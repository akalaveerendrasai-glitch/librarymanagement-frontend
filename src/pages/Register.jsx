import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Controlled component input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-level error upon typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  // Client-side form validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirming your password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await register(formData.name, formData.email, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/books');
    } else {
      if (result.validationErrors) {
        setFieldErrors(result.validationErrors);
      }
      setServerError(result.error);
    }
  };

  return (
    <div className="card form-card">
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <span style={{ fontSize: '2.5rem' }}>📝</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-main)' }}>
          Create Member Account
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Join the library to search and borrow books (always registers as standard Member)
        </p>
      </div>

      <Alert type="error" message={serverError} onClose={() => setServerError('')} />

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name Field (Controlled) */}
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-control"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            style={fieldErrors.name ? { borderColor: 'var(--danger)' } : {}}
            autoComplete="name"
            disabled={isSubmitting}
          />
          {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
        </div>

        {/* Email Field (Controlled) */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            placeholder="student@example.com"
            value={formData.email}
            onChange={handleChange}
            style={fieldErrors.email ? { borderColor: 'var(--danger)' } : {}}
            autoComplete="email"
            disabled={isSubmitting}
          />
          {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
        </div>

        {/* Password Field (Controlled) */}
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password * (min. 6 characters)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            style={fieldErrors.password ? { borderColor: 'var(--danger)' } : {}}
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          {fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
        </div>

        {/* Confirm Password Field (Controlled) */}
        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Confirm Password *
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={fieldErrors.confirmPassword ? { borderColor: 'var(--danger)' } : {}}
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          {fieldErrors.confirmPassword && <div className="form-error">{fieldErrors.confirmPassword}</div>}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '1.25rem' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering Account...' : 'Complete Registration'}
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In Here
          </Link>
        </div>
      </form>
    </div>
  );
}
