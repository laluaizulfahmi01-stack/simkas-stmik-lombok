// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LogoutConfirmModal from '../components/LogoutConfirmModal';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('simkas_token');
    if (!token) return null;
    try {
      const res = await api.get('/profile');
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('simkas_user', JSON.stringify(res.data));
        setActiveUkmId(prev => prev || res.data.ukms?.[0]?.id || null);
        return res.data;
      }
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('simkas_token');
    if (token) {
      refreshProfile();
    }
  }, [refreshProfile]);

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
    setShowLogoutModal(false);
  }, []);

  const promptLogout = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const cancelLogout = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  const confirmLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const updateUser = useCallback((updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('simkas_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      promptLogout,
      cancelLogout,
      confirmLogout,
      showLogoutModal,
      setShowLogoutModal,
      updateUser,
      refreshProfile,
      activeUkmId,
      setActiveUkmId
    }}>
      {children}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        user={user}
      />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
