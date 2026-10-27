// src/components/MobileNav.jsx
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiCreditCard, FiCheckSquare,
  FiGrid, FiUsers, FiSettings, FiUserPlus
} from 'react-icons/fi';

export default function MobileNav() {
  const { user } = useAuth();
  const location = useLocation();

  // Hide on public and exterior pages
  if (!user || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const studentItems = [
    { to: '/student',             icon: <FiHome />,        label: 'Beranda' },
    { to: '/student/pendaftaran', icon: <FiUserPlus />,    label: 'Daftar' },
    { to: '/student/kas',         icon: <FiCreditCard />,  label: 'Kas' },
    { to: '/student/absen',       icon: <FiCheckSquare />, label: 'Absen' },
    { to: '/student/settings',    icon: <FiSettings />,    label: 'Setelan' },
  ];

  const managerItems = [
    { to: '/manager',             icon: <FiHome />,        label: 'Beranda' },
    { to: '/manager/pendaftaran', icon: <FiUserPlus />,    label: 'Seleksi' },
    { to: '/manager/kas',         icon: <FiCreditCard />,  label: 'Kas' },
    { to: '/manager/absen',       icon: <FiCheckSquare />, label: 'Absen' },
    { to: '/manager/settings',    icon: <FiSettings />,    label: 'Setelan' },
  ];

  const adminItems = [
    { to: '/admin',          icon: <FiHome />,     label: 'Dashboard' },
    { to: '/admin/ukm',      icon: <FiGrid />,     label: 'UKM' },
    { to: '/admin/users',    icon: <FiUsers />,    label: 'Pengguna' },
    { to: '/admin/settings', icon: <FiSettings />, label: 'Setelan' },
  ];

  const items =
    user.role === 'superadmin' ? adminItems :
    user.role === 'manager'    ? managerItems :
                                 studentItems;

  return (
    <nav className="mobile-bottom-nav">
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/student' || item.to === '/manager' || item.to === '/admin'}
          className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
        >
          <span className="mobile-nav-icon">{item.icon}</span>
          <span className="mobile-nav-text">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
