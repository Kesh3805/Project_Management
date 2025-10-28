import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchUser = async (authToken) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setUser(response.data.data);
      return true;
    } catch (error) {
      console.error('Error fetching user:', error);
      // Token might be invalid, clear it
      logout();
      return false;
    }
  };

  // Initialize on mount - check for existing token
  useEffect(() => {
    const initAuth = async () => {
      // First, check URL for token from OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      
      if (tokenFromUrl) {
        console.log('Found token in URL:', tokenFromUrl.substring(0, 20) + '...');
        // Store token from OAuth callback
        localStorage.setItem('token', tokenFromUrl);
        setToken(tokenFromUrl);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Fetch user data
        await fetchUser(tokenFromUrl);
      } else {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          console.log('Found stored token:', storedToken.substring(0, 20) + '...');
          setToken(storedToken);
          await fetchUser(storedToken);
        } else {
          console.log('No token found');
        }
      }
      
      setLoading(false);
      setInitialized(true);
    };

    if (!initialized) {
      initAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token && !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
