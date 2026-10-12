export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div>
          <p style={{ fontWeight: 700, color: 'var(--text-main)' }}>📚 Library Management System</p>
          <p style={{ fontSize: '0.85rem' }}>An academic full-stack project built with React, Spring Boot, and MySQL.</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
          <p>&copy; {new Date().getFullYear()} LibraryHub. All rights reserved.</p>
          <p style={{ color: 'var(--text-light)' }}>Role-Based Access: Student (USER) &amp; Librarian (ADMIN)</p>
        </div>
      </div>
    </footer>
  );
}
