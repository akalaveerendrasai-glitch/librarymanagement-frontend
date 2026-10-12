import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to normalize roles (handles 'USER' or 'ROLE_USER')
  const normalizeRole = (role) => {
    if (!role) return null;
    return role.startsWith('ROLE_') ? role.substring(5) : role;
  };

  // Restore authenticated session from localStorage on application boot
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser({
          ...parsedUser,
          role: normalizeRole(parsedUser.role),
        });
      } catch (err) {
        console.error('Failed to parse cached user details:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Listen for automatic 401 Unauthorized events from Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  /**
   * Log in user using backend credentials contract:
   * Request: { email, password }
   * Response: { token, type, id, name, email, role }
   */
  const login = useCallback(async (email, password) => {
    try {
      const response = await axiosClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password,
      });

      const data = response.data;
      const normalizedRole = normalizeRole(data.role);

      const userProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: normalizedRole,
      };

      setToken(data.token);
      setUser(userProfile);

      // Persist in localStorage (passwords are never stored!)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userProfile));

      return { success: true, user: userProfile };
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        (error.response?.status === 401 ? 'Invalid email or password.' : 'Login failed. Please check your network.');

      return { success: false, error: serverMessage };
    }
  }, []);

  /**
   * Register a new library member using backend contract:
   * Request: { name, email, password }
   * Response: { token, type, id, name, email, role: 'USER' }
   */
  const register = useCallback(async (name, email, password) => {
    try {
      const response = await axiosClient.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      });

      const data = response.data;
      const normalizedRole = normalizeRole(data.role);

      const userProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: normalizedRole,
      };

      setToken(data.token);
      setUser(userProfile);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userProfile));

      return { success: true, user: userProfile };
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.validationErrors?.email ||
        'Registration failed. Please check your information.';

      return { 
        success: false, 
        error: serverMessage, 
        validationErrors: error.response?.data?.validationErrors || null 
      };
    }
  }, []);

  /**
   * Logout user and clear all client-side security tokens
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'ADMIN',
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
