import React from 'react';

/**
 * React Error Boundary component to prevent whole-page white-screen crashes
 * when unexpected JavaScript rendering errors occur.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
        }}>
          <div className="card" style={{ maxWidth: '580px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
            <span style={{ fontSize: '3.5rem' }}>⚠️</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '1rem', color: 'var(--text-main)' }}>
              Something Went Wrong
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.75rem 0 1.75rem' }}>
              An unexpected client-side rendering error occurred. The application state has been safely halted to protect your session.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => window.location.reload()} className="btn btn-outline">
                Reload Application
              </button>
              <button onClick={this.handleReset} className="btn btn-primary">
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
