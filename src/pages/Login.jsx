import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after successful login
  const from = location.state?.from?.pathname || '/';

  // Controlled component input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field validation error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address (e.g., student@example.com).';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      // Direct Admin users to the dashboard, members to the previous page or home
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    } else {
      setServerError(result.error);
    }
  };

  // Helper for quick testing in development and academic presentation
  const fillDemo = (role) => {
    if (role === 'ADMIN') {
      setFormData({ email: 'admin@library.com', password: 'Admin@123' });
    } else {
      setFormData({ email: 'jane@example.com', password: 'Password@123' });
    }
    setFieldErrors({});
    setServerError('');
  };

  return (
    <div className="card form-card">
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <span style={{ fontSize: '2.5rem' }}>🔐</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-main)' }}>
          Sign In
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Enter your academic library credentials to access your account
        </p>
      </div>

      <Alert type="error" message={serverError} onClose={() => setServerError('')} />

      <form onSubmit={handleSubmit} noValidate>
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
            Password *
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
            autoComplete="current-password"
            disabled={isSubmitting}
          />
          {fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '1.25rem' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Authenticating with Server...' : 'Sign In'}
        </button>

        {/* Demo Credentials Helper */}
        <div style={{
          padding: '0.85rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.82rem',
          border: '1px dashed var(--border)'
        }}>
          <p style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            🧪 Quick Demo Fill (Testing):
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fillDemo('USER')}
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: '0.78rem' }}
              disabled={isSubmitting}
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => fillDemo('ADMIN')}
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: '0.78rem' }}
              disabled={isSubmitting}
            >
              Demo Admin
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Register as a Member
          </Link>
        </div>
      </form>
    </div>
  );
}
