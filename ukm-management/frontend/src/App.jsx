// src/App.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import MobileNav from './components/MobileNav';

// ── Lazy-loaded Route Components for Fast Initial Page Load ─────────────────
const LandingPage        = lazy(() => import('./pages/LandingPage'));
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));

const StudentDashboard   = lazy(() => import('./pages/student/StudentDashboard'));
const StudentPendaftaranPage = lazy(() => import('./pages/student/PendaftaranUkmPage'));
const StudentKasPage     = lazy(() => import('./pages/student/KasPage'));
const StudentAbsenPage   = lazy(() => import('./pages/student/AbsenPage'));
const StudentSejarahPage = lazy(() => import('./pages/student/SejarahPage'));
const StudentCapaianPage = lazy(() => import('./pages/student/CapaianPage'));

const ManagerDashboard   = lazy(() => import('./pages/manager/ManagerDashboard'));
const ManagerPendaftaranPage = lazy(() => import('./pages/manager/PendaftaranPage'));
const ManagerKasPage     = lazy(() => import('./pages/manager/KasPage'));
const ManagerAbsenPage   = lazy(() => import('./pages/manager/AbsenPage'));
const AnggotaPage        = lazy(() => import('./pages/manager/AnggotaPage'));
const ProfilUkmPage      = lazy(() => import('./pages/manager/ProfilUkmPage'));
const ManagerCapaianPage = lazy(() => import('./pages/manager/CapaianPage'));

const AdminDashboard     = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUkmPage       = lazy(() => import('./pages/admin/UkmPage'));
const AdminUsersPage     = lazy(() => import('./pages/admin/UsersPage'));
const SettingsPage       = lazy(() => import('./pages/SettingsPage'));

import SimkasLoader from './components/SimkasLoader';

// Sleek Fallback Loader with official logo & silky motion
function RouteFallback() {
  return (
    <SimkasLoader
      fullScreen={false}
      size="compact"
      title="SIMKAS"
      subtitle="Memuat Halaman..."
      badge="STMIK Lombok"
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/"         element={<LandingPage />} />
                <Route path="/login"    element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Student Routes */}
                <Route path="/student"              element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
                <Route path="/student/pendaftaran"  element={<ProtectedRoute roles={['student']}><StudentPendaftaranPage /></ProtectedRoute>} />
                <Route path="/student/kas"          element={<ProtectedRoute roles={['student']}><StudentKasPage /></ProtectedRoute>} />
                <Route path="/student/absen"        element={<ProtectedRoute roles={['student']}><StudentAbsenPage /></ProtectedRoute>} />
                <Route path="/student/sejarah"      element={<ProtectedRoute roles={['student']}><StudentSejarahPage /></ProtectedRoute>} />
                <Route path="/student/capaian"      element={<ProtectedRoute roles={['student']}><StudentCapaianPage /></ProtectedRoute>} />
                <Route path="/student/settings"     element={<ProtectedRoute roles={['student']}><SettingsPage /></ProtectedRoute>} />

                {/* Manager Routes */}
                <Route path="/manager"              element={<ProtectedRoute roles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
                <Route path="/manager/pendaftaran"  element={<ProtectedRoute roles={['manager']}><ManagerPendaftaranPage /></ProtectedRoute>} />
                <Route path="/manager/kas"          element={<ProtectedRoute roles={['manager']}><ManagerKasPage /></ProtectedRoute>} />
                <Route path="/manager/absen"        element={<ProtectedRoute roles={['manager']}><ManagerAbsenPage /></ProtectedRoute>} />
                <Route path="/manager/anggota"      element={<ProtectedRoute roles={['manager']}><AnggotaPage /></ProtectedRoute>} />
                <Route path="/manager/profil"       element={<ProtectedRoute roles={['manager']}><ProfilUkmPage /></ProtectedRoute>} />
                <Route path="/manager/capaian"      element={<ProtectedRoute roles={['manager']}><ManagerCapaianPage /></ProtectedRoute>} />
                <Route path="/manager/settings"     element={<ProtectedRoute roles={['manager']}><SettingsPage /></ProtectedRoute>} />

                {/* Super Admin Routes */}
                <Route path="/admin"          element={<ProtectedRoute roles={['superadmin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/ukm"      element={<ProtectedRoute roles={['superadmin']}><AdminUkmPage /></ProtectedRoute>} />
                <Route path="/admin/users"    element={<ProtectedRoute roles={['superadmin']}><AdminUsersPage /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute roles={['superadmin']}><SettingsPage /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <MobileNav />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
