import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import {
  FiHome, FiUserPlus, FiCreditCard, FiCheckSquare,
  FiBookOpen, FiAward, FiSettings, FiUsers, FiGrid,
  FiLogOut, FiZap, FiCheckCircle
} from 'react-icons/fi';

const studentNav = [
  { to: '/student',             icon: <FiHome />,        label: 'Dashboard' },
  { to: '/student/pendaftaran', icon: <FiUserPlus />,    label: 'Pendaftaran UKM', badge: '2' },
  { to: '/student/kas',         icon: <FiCreditCard />,  label: 'Catatan Kas' },
  { to: '/student/absen',       icon: <FiCheckSquare />, label: 'Presensi' },
  { to: '/student/sejarah',     icon: <FiBookOpen />,    label: 'Sejarah UKM' },
  { to: '/student/capaian',     icon: <FiAward />,       label: 'Capaian & E-Book' },
  { to: '/student/settings',    icon: <FiSettings />,    label: 'Setelan Akun' },
];

const managerNav = [
  { to: '/manager',             icon: <FiHome />,        label: 'Dashboard' },
  { to: '/manager/pendaftaran', icon: <FiUserPlus />,    label: 'Seleksi Pendaftar', badge: 'Baru' },
  { to: '/manager/anggota',     icon: <FiUsers />,       label: 'Anggota UKM' },
  { to: '/manager/kas',         icon: <FiCreditCard />,  label: 'Kelola Kas' },
  { to: '/manager/absen',       icon: <FiCheckSquare />, label: 'Kelola Presensi' },
  { to: '/manager/profil',      icon: <FiBookOpen />,    label: 'Profil & Sejarah' },
  { to: '/manager/capaian',     icon: <FiAward />,       label: 'Capaian & E-Book' },
  { to: '/manager/settings',    icon: <FiSettings />,    label: 'Setelan Akun' },
];

const adminNav = [
  { to: '/admin',            icon: <FiHome />,        label: 'Dashboard' },
  { to: '/admin/ukm',        icon: <FiGrid />,        label: 'Kelola UKM', badge: '4' },
  { to: '/admin/users',      icon: <FiUsers />,       label: 'Kelola User' },
  { to: '/admin/settings',   icon: <FiSettings />,    label: 'Setelan Akun' },
];

export default function Sidebar() {
  const { user, promptLogout } = useAuth();

  // Filter student nav items based on membership status:
  // If student has NOT been accepted yet (no active UKMs), hide Kas and Absensi
  const isAcceptedMember = Boolean(user?.ukms && user.ukms.length > 0);
  const filteredStudentNav = studentNav.filter(item => {
    if (!isAcceptedMember && (item.to === '/student/kas' || item.to === '/student/absen')) {
      return false;
    }
    return true;
  });

  const navItems =
    user?.role === 'superadmin' ? adminNav :
    user?.role === 'manager'    ? managerNav :
                                  filteredStudentNav;

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      {/* Official SIMKAS Brand Logo */}
      <div className="sidebar-logo">
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/simkas-logo.png"
            alt="Logo SIMKAS"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scale(1.42)',
            }}
          />
        </div>
        <div className="logo-text">
          SIMKAS
          <span>STMIK Lombok</span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="sidebar-nav-list">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/student' || item.to === '/manager' || item.to === '/admin'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && (
              <span className="nav-badge-pill">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Influency-Style Bottom Card ("Upgrade to Pro" Equivalent) */}
      <div className="sidebar-bottom-section">
        <div className="sidebar-pro-card">
          <div className="sidebar-pro-badge">
            <FiZap />
          </div>
          <div className="sidebar-pro-title">SIMKAS Portal</div>
          <div className="sidebar-pro-sub">
            Akses penuh seluruh transparansi kas & kegiatan resmi UKM
          </div>
          <button className="sidebar-pro-btn" onClick={promptLogout}>
            <FiLogOut style={{ marginRight: 4 }} /> Keluar Akun
          </button>
        </div>

        {/* User Mini Bar & Theme Switch */}
        <div className="sidebar-user-row">
          <div className="sidebar-user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              initials
            )}
          </div>
          <div className="sidebar-user-meta">
            <div className="sidebar-user-name">
              <span>{user?.name || 'Pengguna'}</span>
              {user?.isVerified && (
                <FiCheckCircle style={{ color: '#2563eb', fontSize: 13, flexShrink: 0 }} title="Terverifikasi" />
              )}
            </div>
            <div className="sidebar-user-role">
              {user?.role === 'superadmin' ? 'Super Admin' :
               user?.role === 'manager'    ? 'Pengelola UKM' : 'Mahasiswa'}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
