import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon">📚</span>
          <span>LibraryHub</span>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Navigation Links (Desktop & Mobile Dropdown) */}
        <nav className={`navbar-collapse ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="navbar-nav">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/books" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                Catalog
              </NavLink>
            </li>

            {/* Member-specific links */}
            {isAuthenticated && !isAdmin && (
              <li>
                <NavLink to="/my-borrowings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                  My Borrowings
                </NavLink>
              </li>
            )}

            {/* Admin-specific links */}
            {isAuthenticated && isAdmin && (
              <>
                <li>
                  <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu} end>
                    Admin Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/books" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                    Manage Books
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* User Profile / Auth Actions */}
          <div className="nav-auth">
            {isAuthenticated ? (
              <>
                <div className="user-badge">
                  <span>👤 {user?.name || user?.email}</span>
                  <span className={`role-tag ${isAdmin ? 'admin' : 'user'}`}>
                    {user?.role || 'USER'}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
