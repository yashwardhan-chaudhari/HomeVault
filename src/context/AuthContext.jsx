import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('hv_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Default to clean white light mode
  });
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('hv_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const savedToken = getAuthToken();
      if (savedToken) {
        const res = await api.getMe();
        setUser(res.user);
        if (res.user.themePreference === 'dark' || res.user.themePreference === 'light') {
          setTheme(res.user.themePreference);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Initializing empty session for login');
      setUser(null);
      setAuthToken(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, pass) => {
    const res = await api.login({ email, password: pass });
    setUser(res.user);
    setToken(res.token);
    setAuthToken(res.token);
    addToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${res.user.fullName}` });
    return res.user;
  };

  const register = async (fullName, email, pass) => {
    const res = await api.register({ fullName, email, password: pass });
    setUser(res.user);
    setToken(res.token);
    setAuthToken(res.token);
    addToast({ type: 'success', title: 'Account created!', message: 'Welcome to HomeVault' });
    return res.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    addToast({ type: 'info', title: 'Logged out', message: 'You have been signed out' });
  };

  const updateProfile = async (data) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
    addToast({ type: 'success', title: 'Profile updated', message: 'Your changes have been saved' });
  };

  const refreshUser = async () => {
    const res = await api.getMe();
    setUser(res.user);
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        theme,
        setTheme,
        toggleTheme,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
