import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import * as authService from '../services/authService';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const loadUser = async () => {
      const storedData = localStorage.getItem('aimtpUser');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (parsedData.accessToken) {
            setUser(parsedData.user);
          }
        } catch (error) {
          console.error('Failed to parse user from local storage:', error);
          localStorage.removeItem('aimtpUser');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const googleLogin = async (token) => {
    const data = await authService.googleLogin(token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    // Redirect to landing page and clear all state via refresh
    // We avoid setUser(null) here to prevent the flicker of the login page
    // caused by ProtectedRoute reacting to the state change before the redirect finishes.
    window.location.href = '/';
  };

  const updateUserProfile = (updatedUser) => {
    setUser(prev => {
      const newUser = { ...prev, ...updatedUser };
      const storedData = localStorage.getItem('aimtpUser');
      if (storedData) {
        const session = JSON.parse(storedData);
        session.user = newUser;
        localStorage.setItem('aimtpUser', JSON.stringify(session));
      }
      return newUser;
    });
  };

  const isProfileComplete = user && (
    user.sector && 
    user.department && 
    user.designation && 
    user.currentZone && 
    user.currentDivision && 
    user.currentStation
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, updateUserProfile, isProfileComplete }}>
      {children}
    </AuthContext.Provider>
  );
};
