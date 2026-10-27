// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('simkas_user')); } catch { return null; }
  });
  const [activeUkmId, setActiveUkmId] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('simkas_user') || 'null');
      return u?.ukms?.[0]?.id || null;
    } catch {
      return null;
    }
  });

  const login = useCallback((token, userData) => {
    localStorage.setItem('simkas_token', token);
    localStorage.setItem('simkas_user', JSON.stringify(userData));
    setUser(userData);
    setActiveUkmId(userData.ukms?.[0]?.id || null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('simkas_token');
    localStorage.removeItem('simkas_user');
    setUser(null);
    setActiveUkmId(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('simkas_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, activeUkmId, setActiveUkmId }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
