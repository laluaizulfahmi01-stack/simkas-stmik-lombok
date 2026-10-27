import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import SimkasLoader from '../components/SimkasLoader';
import {
  FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight,
  FiCheck, FiMoon, FiSun, FiShield, FiZap, FiAward
} from 'react-icons/fi';

export default function LoginPage() {
  const [form, setForm] = useState({ nim: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loaderState, setLoaderState] = useState({
    active: false,
    title: 'SIMKAS STMIK Lombok',
    subtitle: 'Memverifikasi Sesi...',
    progress: 25,
    isExiting: false,
  });
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (!form.nim || !form.password) {
      return toast('Mohon masukkan NIM/Username dan kata sandi Anda', 'warning');
    }
    setLoading(true);
    setLoaderState({
      active: true,
      title: 'SIMKAS STMIK Lombok',
      subtitle: 'Memverifikasi Kredensial...',
      progress: 35,
      isExiting: false,
    });

    try {
      const { data } = await api.post('/auth/login', form);
      const role = data.user.role;
      const roleLabel =
        role === 'superadmin' ? 'Super Admin' :
        role === 'manager' ? 'Pengelola UKM' : 'Mahasiswa';

      // Stage 2: Smooth 100% completion & personalized greeting
      setLoaderState({
        active: true,
        title: `Selamat Datang, ${data.user.name}`,
        subtitle: `Menyiapkan Ruang Kerja ${roleLabel}...`,
        progress: 100,
        isExiting: false,
      });

      // Quick smooth dwell (420ms) so motion is appreciated without lag
      await new Promise(r => setTimeout(r, 420));

      setLoaderState(prev => ({ ...prev, isExiting: true }));
      login(data.token, data.user);
      toast('Selamat datang, ' + data.user.name + '! 👋', 'success');

      // Exit transition (220ms) then navigate smoothly
      setTimeout(() => {
        navigate(role === 'superadmin' ? '/admin' : role === 'manager' ? '/manager' : '/student');
      }, 220);
    } catch (err) {
      setLoaderState({ active: false, isExiting: false });
      setLoading(false);
      toast(err.response?.data?.message || 'Login gagal, periksa kredensial Anda', 'error');
    }
  };

  const fillQuickLogin = (nim, password, roleName) => {
    setForm({ nim, password });
    toast(`Akun demo ${roleName} dipilih! Klik Login untuk masuk.`, 'info');
  };

  const isDemoLoader = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo_loader');

  return (
    <div className="glass-login-viewport">
      {/* ── Official SIMKAS Smooth Transition Loader ── */}
      {(loaderState.active || isDemoLoader) && (
        <SimkasLoader
          fullScreen={true}
          title={isDemoLoader ? 'Selamat Datang, Super Admin' : loaderState.title}
          subtitle={isDemoLoader ? 'Menyiapkan Ruang Kerja Admin...' : loaderState.subtitle}
          progress={isDemoLoader ? 75 : loaderState.progress}
          isExiting={loaderState.isExiting}
          badge="Portal SIMKAS &bull; STMIK Lombok"
        />
      )}
      {/* ── Ambient Floating Glass Spheres & Rings (Reference Background) ── */}
      <div className="glass-dec-ring-top" />
      <div className="glass-dec-sphere-right" />
      <div className="glass-dec-arc-bottom-left" />
      <div className="glass-dec-contour-bottom-right" />

      {/* ── Top-Right Theme Toggle Squircle ── */}
      <button
        type="button"
        className="glass-theme-btn"
        onClick={toggleTheme}
        title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        aria-label="Toggle Theme"
      >
        {isDark ? <FiSun style={{ fontSize: 20, color: '#facc15' }} /> : <FiMoon style={{ fontSize: 20 }} />}
      </button>

      {/* ── Central Glass Column ── */}
      <div className="glass-login-container">
        
        {/* ── Official SIMKAS 3D Emblem Box ── */}
        <div className="glass-emblem-box" style={{ overflow: 'hidden', padding: 0 }}>
          <img
            src="/simkas-logo.png"
            alt="Logo Resmi SIMKAS"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scale(1.42)',
              borderRadius: 'inherit',
              display: 'block',
            }}
          />
        </div>

        {/* ── Title & Subtitle ── */}
        <h1 className="glass-login-title">Welcome Back</h1>
        <div className="glass-login-sub">Sign in to continue</div>

        {/* ── Form Inputs ── */}
        <form onSubmit={submit} className="glass-login-form">
          {/* Username / NIM Input */}
          <div className="glass-input-pill">
            <span className="glass-input-icon">
              <FiUser />
            </span>
            <input
              className="glass-input-field"
              name="nim"
              placeholder="Username or NIM"
              value={form.nim}
              onChange={handle}
              required
              autoComplete="username"
            />
          </div>

          {/* Password Input */}
          <div className="glass-input-pill">
            <span className="glass-input-icon">
              <FiLock />
            </span>
            <input
              className="glass-input-field"
              name="password"
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={handle}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="glass-input-toggle"
              onClick={() => setShowPw(!showPw)}
              title={showPw ? 'Sembunyikan Sandi' : 'Tampilkan Sandi'}
            >
              {showPw ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="glass-options-row">
            <label className="glass-remember-label" onClick={() => setRememberMe(!rememberMe)}>
              <div className={`glass-checkbox ${rememberMe ? 'checked' : ''}`}>
                {rememberMe && <FiCheck style={{ fontSize: 13, strokeWidth: 3 }} />}
              </div>
              <span>Remember Me</span>
            </label>

            <span
              className="glass-forgot-link"
              onClick={() => toast('Hubungi Super Admin atau Pengelola UKM untuk reset kata sandi', 'info')}
              style={{ cursor: 'pointer' }}
            >
              Forgot Password?
            </span>
          </div>

          {/* Glowing Royal Sapphire Pill Login Button */}
          <button
            type="submit"
            className="glass-submit-btn"
            disabled={loading}
          >
            <span className="glass-submit-btn-text">
              {loading ? 'Signing in...' : 'Login'}
            </span>
            <div className="glass-submit-btn-arrow">
              <FiArrowRight />
            </div>
          </button>
        </form>

        {/* ── "OR CONTINUE WITH" Divider ── */}
        <div className="glass-divider-row">
          <div className="glass-divider-line" />
          <span className="glass-divider-text">OR CONTINUE WITH</span>
          <div className="glass-divider-line" />
        </div>

        {/* ── 3 Frosted Glass Squircle Role Buttons (Mahasiswa, Pengelola, Admin) ── */}
        <div className="glass-roles-row">
          {/* Button 1: Mahasiswa */}
          <button
            type="button"
            className="glass-role-squircle"
            onClick={() => fillQuickLogin('220101001', 'password123', 'Mahasiswa')}
            title="1-Klik Login Mahasiswa (NIM: 220101001)"
          >
            <span className="glass-role-icon" style={{ color: '#2563eb' }}>
              <FiUser />
            </span>
            <span className="glass-role-label">Mahasiswa</span>
          </button>

          {/* Button 2: Pengelola UKM */}
          <button
            type="button"
            className="glass-role-squircle"
            onClick={() => fillQuickLogin('manager_techcode', 'manager123', 'Pengelola Techcode')}
            title="1-Klik Login Pengelola (manager_techcode)"
          >
            <span className="glass-role-icon" style={{ color: '#0ea5e9' }}>
              <FiZap />
            </span>
            <span className="glass-role-label">Pengelola</span>
          </button>

          {/* Button 3: Super Admin */}
          <button
            type="button"
            className="glass-role-squircle"
            onClick={() => fillQuickLogin('admin', 'admin123', 'Super Admin')}
            title="1-Klik Login Super Admin (admin)"
          >
            <span className="glass-role-icon" style={{ color: '#1d4ed8' }}>
              <FiShield />
            </span>
            <span className="glass-role-label">Admin</span>
          </button>
        </div>

        {/* ── Tagline Spaced Text ── */}
        <div className="glass-tagline">
          TRANSPARAN &bull; MODERN &bull; TERPADU
        </div>

        {/* ── Footer Navigation Links ── */}
        <div className="glass-footer-links">
          <div>
            Belum memiliki akun?{' '}
            <Link to="/register">Daftar Mahasiswa</Link>
          </div>
          <div>
            <Link to="/" style={{ color: '#64748b', fontSize: 12 }}>
              &larr; Kembali ke Beranda Utama
            </Link>
          </div>
        </div>
      </div>

      {/* ── Subtle Corner Brand Watermark ── */}
      <div className="glass-corner-brand">
        SIMKAS<br />
        STMIK LOMBOK
      </div>
    </div>
  );
}
