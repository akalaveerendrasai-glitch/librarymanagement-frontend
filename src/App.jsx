import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookCatalog from './pages/BookCatalog';
import BookDetails from './pages/BookDetails';
import MyBorrowings from './pages/MyBorrowings';
import AdminDashboard from './pages/AdminDashboard';
import ManageBooks from './pages/ManageBooks';
import BookForm from './pages/BookForm';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/books" element={<BookCatalog />} />
              <Route path="/books/:id" element={<BookDetails />} />

              {/* User (Member) Protected Routes */}
              <Route
                path="/my-borrowings"
                element={
                  <ProtectedRoute>
                    <MyBorrowings />
                  </ProtectedRoute>
                }
              />

              {/* Admin (Librarian) Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/books"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ManageBooks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/books/new"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <BookForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/books/edit/:id"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <BookForm />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
