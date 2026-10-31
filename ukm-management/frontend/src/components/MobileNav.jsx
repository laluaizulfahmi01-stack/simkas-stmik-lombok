// src/components/MobileNav.jsx - Standard Website Responsive Navigation Toggle & Off-canvas Drawer
import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import {
  HiBars3BottomLeft,
  HiXMark,
  HiOutlineHome,
  HiOutlineUserPlus,
  HiOutlineUsers,
  HiOutlineBanknotes,
  HiOutlineQrCode,
  HiOutlineBookOpen,
  HiOutlineTrophy,
  HiOutlineCog6Tooth,
  HiOutlineSquares2X2,
  HiOutlineUserGroup,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronRight,
  HiOutlineBell,
} from 'react-icons/hi2';
import NotificationModal from './NotificationModal';

export default function MobileNav() {
  const { user, promptLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hide on public and exterior pages
  if (!user || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    setIsOpen(false);
    promptLogout();
  };

  const studentItems = [
    {
      to: '/student',
      label: 'Dashboard',
      sub: 'Ringkasan aktivitas & status UKM',
      icon: <HiOutlineHome />,
      colorClass: 'icon-blue',
    },
    {
      to: '/student/pendaftaran',
      label: 'Pendaftaran UKM',
      sub: 'Daftar & pantau seleksi UKM',
      icon: <HiOutlineUserPlus />,
      badge: '2',
      colorClass: 'icon-amber',
    },
    {
      to: '/student/kas',
      label: 'Catatan Kas',
      sub: 'Transparansi perputaran kas UKM',
      icon: <HiOutlineBanknotes />,
      colorClass: 'icon-lime',
    },
    {
      to: '/student/absen',
      label: 'Presensi Mandiri',
      sub: 'Check-in token & izin pertemuan',
      icon: <HiOutlineQrCode />,
      colorClass: 'icon-purple',
    },
    {
      to: '/student/sejarah',
      label: 'Sejarah & Profil',
      sub: 'Visi, misi, struktur & sejarah UKM',
      icon: <HiOutlineBookOpen />,
      colorClass: 'icon-cyan',
    },
    {
      to: '/student/capaian',
      label: 'Capaian & E-Book',
      sub: 'Prestasi, sertifikat & materi UKM',
      icon: <HiOutlineTrophy />,
      colorClass: 'icon-yellow',
    },
    {
      to: '/student/settings',
      label: 'Setelan Akun',
      sub: 'Profil, kontak & kata sandi',
      icon: <HiOutlineCog6Tooth />,
      colorClass: 'icon-slate',
    },
  ];

  const managerItems = [
    {
      to: '/manager',
      label: 'Dashboard',
      sub: 'Pusat komando & statistik UKM',
      icon: <HiOutlineHome />,
      colorClass: 'icon-blue',
    },
    {
      to: '/manager/pendaftaran',
      label: 'Seleksi Pendaftar',
      sub: 'Verifikasi berkas calon anggota',
      icon: <HiOutlineUserPlus />,
      badge: 'Baru',
      colorClass: 'icon-amber',
    },
    {
      to: '/manager/anggota',
      label: 'Anggota UKM',
      sub: 'Daftar anggota resmi & jabatan',
      icon: <HiOutlineUsers />,
      colorClass: 'icon-teal',
    },
    {
      to: '/manager/kas',
      label: 'Kelola Kas',
      sub: 'Pembukuan kas, LPJ & perputaran dana',
      icon: <HiOutlineBanknotes />,
      colorClass: 'icon-lime',
    },
    {
      to: '/manager/absen',
      label: 'Kelola Presensi',
      sub: 'Buka sesi & generate token',
      icon: <HiOutlineQrCode />,
      colorClass: 'icon-purple',
    },
    {
      to: '/manager/profil',
      label: 'Profil & Sejarah',
      sub: 'Edit visi, misi & profil UKM',
      icon: <HiOutlineBookOpen />,
      colorClass: 'icon-cyan',
    },
    {
      to: '/manager/capaian',
      label: 'Capaian & E-Book',
      sub: 'Unggah modul, e-book & piala',
      icon: <HiOutlineTrophy />,
      colorClass: 'icon-yellow',
    },
    {
      to: '/manager/settings',
      label: 'Setelan Akun',
      sub: 'Pengaturan profil pengelola',
      icon: <HiOutlineCog6Tooth />,
      colorClass: 'icon-slate',
    },
  ];

  const adminItems = [
    {
      to: '/admin',
      label: 'Dashboard Utama',
      sub: 'Ringkasan ekosistem seluruh UKM',
      icon: <HiOutlineHome />,
      colorClass: 'icon-blue',
    },
    {
      to: '/admin/ukm',
      label: 'Kelola UKM',
      sub: 'Manajemen organisasi UKM kampus',
      icon: <HiOutlineSquares2X2 />,
      badge: '4',
      colorClass: 'icon-indigo',
    },
    {
      to: '/admin/users',
      label: 'Kelola Pengguna',
      sub: 'Hak akses & akun SIMKAS',
      icon: <HiOutlineUserGroup />,
      colorClass: 'icon-teal',
    },
    {
      to: '/admin/settings',
      label: 'Setelan Sistem',
      sub: 'Konfigurasi & parameter portal',
      icon: <HiOutlineCog6Tooth />,
      colorClass: 'icon-slate',
    },
  ];

  const isAcceptedMember = Boolean(user?.ukms && user.ukms.length > 0);
  const activeStudentItems = studentItems.filter(item => {
    if (!isAcceptedMember && (item.to === '/student/kas' || item.to === '/student/absen')) {
      return false;
    }
    return true;
  });

  const items =
    user.role === 'superadmin' ? adminItems :
    user.role === 'manager'    ? managerItems :
                                 activeStudentItems;

  const roleTitle =
    user.role === 'superadmin' ? 'Super Admin BEM' :
    user.role === 'manager'    ? 'Pengelola UKM Resmi' :
                                 'Mahasiswa Aktif';

  const userInitial = (user?.name?.[0] || 'U').toUpperCase();

  return (
    <>
      {/* ── Fixed Mobile Top Bar (Standard Website Header on Mobile) ── */}
      <header className="mobile-top-bar">
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Buka Menu Navigasi"
        >
          <HiBars3BottomLeft className="mobile-toggle-icon" />
          <span className="mobile-toggle-label">Menu</span>
        </button>

        <div className="mobile-brand-pill">
          <div className="mobile-brand-logo">
            <img src="/simkas-logo.png" alt="Logo SIMKAS" />
          </div>
          <div className="mobile-brand-info">
            <span className="mobile-brand-name">SIMKAS</span>
            <span className="mobile-brand-tag">STMIK Lombok</span>
          </div>
        </div>

        <div className="mobile-header-actions">
          <button
            type="button"
            className="mobile-notif-btn"
            onClick={() => setNotifOpen(true)}
            aria-label="Pusat Notifikasi"
            title="Pusat Notifikasi SIMKAS"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 8px',
              fontSize: 22,
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              borderRadius: 8,
            }}
          >
            <HiOutlineBell />
            <span
              style={{
                position: 'absolute',
                top: 6,
                right: 7,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 0 2px var(--bg-card, #fff)',
              }}
            />
          </button>
          <ThemeToggle />
          <button
            type="button"
            className="mobile-avatar-btn"
            onClick={() => setIsOpen(true)}
            title="Buka Menu Profil"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              userInitial
            )}
          </button>
        </div>
      </header>

      {/* ── Backdrop Overlay ── */}
      <div
        className={`mobile-drawer-overlay${isOpen ? ' active' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      {/* ── Slide-Out Mobile Drawer Menu ── */}
      <aside
        className={`mobile-drawer-sheet${isOpen ? ' active' : ''}`}
        aria-label="Menu Navigasi Mobile"
      >
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <div className="mobile-drawer-logo">
              <img src="/simkas-logo.png" alt="Logo SIMKAS" />
            </div>
            <div>
              <div className="mobile-drawer-title">SIMKAS</div>
              <div className="mobile-drawer-sub">STMIK Lombok Portal</div>
            </div>
          </div>
          <button
            type="button"
            className="mobile-drawer-close"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup Menu"
          >
            <HiXMark />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="mobile-drawer-user-card">
          <div className="mobile-drawer-user-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              userInitial
            )}
          </div>
          <div className="mobile-drawer-user-info">
            <div className="mobile-drawer-user-name">
              {user.name || 'Pengguna'}
            </div>
            <div className="mobile-drawer-user-role">
              <span className="role-dot" />
              {roleTitle}
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="mobile-drawer-nav-section">
          <div className="mobile-drawer-section-title">NAVIGASI UTAMA</div>
          <div className="mobile-drawer-nav-list">
            {items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/student' || item.to === '/manager' || item.to === '/admin'}
                className={({ isActive }) => `mobile-drawer-nav-item${isActive ? ' active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <div className={`nav-icon-badge ${item.colorClass}`}>
                  {item.icon}
                </div>
                <div className="nav-item-body">
                  <div className="nav-item-title-row">
                    <span className="nav-item-title">{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge-pill">{item.badge}</span>
                    )}
                  </div>
                  <span className="nav-item-sub">{item.sub}</span>
                </div>
                <HiOutlineChevronRight className="nav-item-arrow" />
              </NavLink>
            ))}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="mobile-drawer-footer">
          <button
            type="button"
            className="mobile-drawer-logout-btn"
            onClick={handleLogout}
          >
            <HiOutlineArrowRightOnRectangle className="logout-icon" />
            <span>Keluar Akun</span>
          </button>
          <div className="mobile-drawer-version">
            SIMKAS STMIK Lombok • Transparan & Akuntabel
          </div>
        </div>
      </aside>

      <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
