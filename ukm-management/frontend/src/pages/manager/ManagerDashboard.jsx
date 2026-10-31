// src/pages/manager/ManagerDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import AnimatedNumber from '../../components/AnimatedNumber';
import api from '../../api/axios';
import {
  FiSearch, FiBell, FiChevronDown, FiArrowUpRight,
  FiDollarSign, FiUsers, FiCreditCard, FiCheckSquare,
  FiAward, FiBookOpen, FiActivity, FiFilter, FiTrendingUp
} from 'react-icons/fi';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [ukms, setUkms] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    api.get('/ukm').then(r => {
      const mine = r.data.filter(u => Number(u.managerId) === Number(user?.id));
      const list = (mine.length || user?.role === 'manager') ? (mine.length ? mine : r.data) : r.data;
      setUkms(list);
      if (list.length) setActiveId(list[0].id);
    });
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    Promise.all([
      api.get(`/ukm/${activeId}/stats`),
      api.get(`/transactions/${activeId}`),
      api.get(`/ukm/${activeId}/achievements`),
    ]).then(([s, t, a]) => {
      setStats(s.data);
      setRecent(t.data.slice(0, 5));
      setAchievements(a.data.slice(0, 3));
    });
  }, [activeId]);

  const activeUkm = ukms.find(u => u.id === activeId);
  const fmt = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* ════ INFLUENCY Top Header Bar ════ */}
        <div className="influency-header">
          <div className="influency-header-left">
            <div className="influency-title-row">
              <h1 className="influency-page-title">Panel Pengelola UKM</h1>
              <span className="influency-pill-badge">{activeUkm?.name || 'UKM Binaan'}</span>
            </div>
            <p className="influency-page-sub">
              Kelola kas masuk/keluar, presensi kegiatan, dan data anggota mahasiswa {activeUkm?.name}
            </p>
          </div>

          <div className="influency-header-right">
            <div className="influency-circle-btn" title="Cari Data">
              <FiSearch />
            </div>
            <div className="influency-circle-btn" title="Notifikasi">
              <FiBell />
              <span className="influency-bell-dot" />
            </div>

            <div className="influency-user-pill">
              <div className="influency-user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  (user?.name?.[0] || 'M').toUpperCase()
                )}
              </div>
              <div className="influency-user-meta">
                <span className="influency-user-welcome">Pengelola UKM</span>
                <span className="influency-user-name">{user?.name || 'Manager'}</span>
              </div>
              <FiChevronDown style={{ color: 'var(--text-muted)', fontSize: 14 }} />
            </div>
          </div>
        </div>

        {/* ════ UKM Switcher Subbar ════ */}
        <div className="influency-switcher-bar" style={{ padding: '0 24px 12px 24px' }}>
          <div className="ukm-switcher">
            {ukms.map(u => (
              <button
                key={u.id}
                className={`ukm-tab${activeId === u.id ? ' active' : ''}`}
                onClick={() => setActiveId(u.id)}
              >
                {u.name}
              </button>
            ))}
          </div>

          <Link to="/manager/kas" className="btn btn-primary btn-sm" style={{ background: '#0f172a', borderColor: '#0f172a', color: '#ffffff', borderRadius: 9999, padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
            <FiCreditCard /> Catat Kas {activeUkm?.name}
          </Link>
        </div>

        {/* ════ Main Content ════ */}
        <div className="main-content">
          
          {/* ════ 4 Top Stat Cards (INFLUENCY Row) ════ */}
          <div className="influency-grid-4">
            
            {/* Card 1: Electric Lime Hero Card */}
            <div className="stat-card-lime">
              <div className="stat-card-top">
                <div className="stat-card-icon-pill">
                  <FiDollarSign />
                </div>
                <Link to="/manager/kas" className="stat-card-arrow-btn" title="Kelola Kas">
                  <FiArrowUpRight />
                </Link>
              </div>
              <div>
                <div className="stat-card-val">
                  <AnimatedNumber value={stats?.balance || 0} formatType="rupiah" />
                </div>
                <div className="stat-card-lbl">Saldo Kas Aktif ({activeUkm?.name})</div>
              </div>
            </div>

            {/* Card 2: Total Pemasukan */}
            <div className="stat-card-white">
              <div className="stat-card-top">
                <div className="stat-card-icon-pill">
                  <FiTrendingUp />
                </div>
                <Link to="/manager/kas" className="stat-card-arrow-btn" title="Lihat Pemasukan">
                  <FiArrowUpRight />
                </Link>
              </div>
              <div>
                <div className="stat-card-val">
                  <AnimatedNumber value={stats?.totalIncome || 0} formatType="rupiah" />
                </div>
                <div className="stat-card-lbl">Total Dana Kas Masuk</div>
              </div>
            </div>

            {/* Card 3: Anggota Aktif */}
            <div className="stat-card-white">
              <div className="stat-card-top">
                <div className="stat-card-icon-pill">
                  <FiUsers />
                </div>
                <Link to="/manager/anggota" className="stat-card-arrow-btn" title="Daftar Anggota">
                  <FiArrowUpRight />
                </Link>
              </div>
              <div>
                <div className="stat-card-val">
                  <AnimatedNumber value={stats?.memberCount || 0} /> <span className="stat-card-subpill">Aktif</span>
                </div>
                <div className="stat-card-lbl">Total Anggota Terdaftar</div>
              </div>
            </div>

            {/* Card 4: Total Pengeluaran */}
            <div className="stat-card-white">
              <div className="stat-card-top">
                <div className="stat-card-icon-pill">
                  <FiCreditCard />
                </div>
                <Link to="/manager/kas" className="stat-card-arrow-btn" title="Lihat Pengeluaran">
                  <FiArrowUpRight />
                </Link>
              </div>
              <div>
                <div className="stat-card-val">
                  <AnimatedNumber value={stats?.totalExpense || 0} formatType="rupiah" />
                </div>
                <div className="stat-card-lbl">Total Kas Digunakan</div>
              </div>
            </div>

          </div>

          {/* ════ Quick Actions Strip ════ */}
          <div className="fast-menu-grid" style={{ marginBottom: 24 }}>
            <Link to="/manager/kas" className="fast-menu-item">
              <div className="fast-menu-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                <FiCreditCard />
              </div>
              <div className="fast-menu-label">Kelola Kas</div>
              <div className="fast-menu-sub">Pencatatan Keuangan</div>
            </Link>

            <Link to="/manager/absen" className="fast-menu-item">
              <div className="fast-menu-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <FiCheckSquare />
              </div>
              <div className="fast-menu-label">Kelola Presensi</div>
              <div className="fast-menu-sub">QR Code & Check-in</div>
            </Link>

            <Link to="/manager/anggota" className="fast-menu-item">
              <div className="fast-menu-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <FiUsers />
              </div>
              <div className="fast-menu-label">Data Anggota</div>
              <div className="fast-menu-sub">{stats?.memberCount || 0} Mahasiswa</div>
            </Link>

            <Link to="/manager/capaian" className="fast-menu-item">
              <div className="fast-menu-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <FiAward />
              </div>
              <div className="fast-menu-label">Capaian & E-Book</div>
              <div className="fast-menu-sub">Modul & Prestasi</div>
            </Link>

            <Link to="/manager/profil" className="fast-menu-item">
              <div className="fast-menu-icon" style={{ background: '#f1f5f9', color: '#0f172a' }}>
                <FiBookOpen />
              </div>
              <div className="fast-menu-label">Profil & Sejarah</div>
              <div className="fast-menu-sub">Visi, Misi & SK</div>
            </Link>
          </div>

          {/* ════ Recent Activity Table ════ */}
          <div className="influency-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Transaksi Kas Terkini ({activeUkm?.name})
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Catatan pembukuan uang kas yang tercatat dalam sistem
                </p>
              </div>
              <Link to="/manager/kas" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                Buka Buku Kas <FiArrowUpRight />
              </Link>
            </div>

            {recent.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                Belum ada transaksi kas untuk {activeUkm?.name}.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Tanggal</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Keterangan</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Tipe</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{t.date}</td>
                        <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.description || '-'}</td>
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 999,
                            background: t.type === 'income' ? '#dcfce7' : '#fee2e2',
                            color: t.type === 'income' ? '#16a34a' : '#dc2626'
                          }}>
                            {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                          </span>
                        </td>
                        <td style={{ padding: '14px', fontWeight: 800, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: t.type === 'income' ? '#16a34a' : 'var(--text-primary)' }}>
                          {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
