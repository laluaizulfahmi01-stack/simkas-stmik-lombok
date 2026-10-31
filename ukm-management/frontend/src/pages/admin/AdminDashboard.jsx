// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import AnimatedNumber from '../../components/AnimatedNumber';
import api from '../../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  FiSearch, FiBell, FiChevronDown, FiArrowUpRight,
  FiBarChart2, FiSliders, FiUsers, FiCreditCard,
  FiTarget, FiDollarSign, FiBriefcase, FiCheckCircle,
  FiTrendingUp, FiLayers, FiActivity, FiFilter
} from 'react-icons/fi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [ukms, setUkms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [chartMode, setChartMode] = useState('Monthly');

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/ukm')])
      .then(([s, u]) => {
        setStats(s.data);
        setUkms(u.data);
      })
      .catch(err => {
        console.error('Error fetching admin dashboard data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const fmt = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const fmtShort = n => {
    const num = Number(n || 0);
    if (num >= 1000000) return 'Rp ' + (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return 'Rp ' + (num / 1000).toFixed(0) + 'k';
    return 'Rp ' + num;
  };

  // Default monthly trends for chart
  const defaultChartData = [
    { label: 'Mei', month: 'May', income: 750000, expense: 420000 },
    { label: 'Jun', month: 'Jun', income: 1100000, expense: 580000 },
    { label: 'Jul', month: 'Jul', income: 890000, expense: 710000 },
    { label: 'Agu', month: 'Aug', income: 1450000, expense: 620000 },
    { label: 'Sep', month: 'Sep', income: 1200000, expense: 800000 },
    { label: 'Okt', month: 'Oct', income: 1630000, expense: 890000 },
  ];

  const chartData = (stats?.monthlyTrends && stats.monthlyTrends.length > 0)
    ? stats.monthlyTrends.map(m => ({
        month: m.label || m.key,
        income: m.income || 0,
        expense: m.expense || 0,
      }))
    : defaultChartData;

  // Custom Floating Black Tooltip like Influency reference ($75,200 Jun 2023)
  const InfluencyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="influency-dark-tooltip">
          <span className="influency-dark-tooltip-amount">
            {fmt(payload[0]?.value)}
          </span>
          <span className="influency-dark-tooltip-date">
            {dataPoint?.month || label} 2026
          </span>
        </div>
      );
    }
    return null;
  };

  // UKM List fallback
  const ukmList = stats?.ukmSummary && stats.ukmSummary.length > 0
    ? stats.ukmSummary
    : ukms.map(u => ({
        id: u.id,
        name: u.name,
        category: u.category || 'Organisasi Kampus',
        manager: u.manager?.name || 'Pengelola UKM',
        balance: 1450000,
        membersCount: 38,
      }));

  const filteredUkms = searchQuery
    ? ukmList.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : ukmList;

  const totalTurnover = (stats?.totalIncome || 0) + (stats?.totalExpense || 0);

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* ════ INFLUENCY Top Header Bar ════ */}
        <div className="influency-header">
          <div className="influency-header-left">
            <div className="influency-title-row">
              <h1 className="influency-page-title">Ringkasan Eksekutif</h1>
              <span className="influency-pill-badge">{ukmList.length} UKM Aktif</span>
            </div>
            <p className="influency-page-sub">
              Pantau seluruh informasi kas, aktivitas donasi/iuran, dan data keanggotaan mahasiswa
            </p>
          </div>

          <div className="influency-header-right">
            <div className="influency-circle-btn" title="Cari Data">
              <FiSearch />
            </div>
            <div className="influency-circle-btn" title="Notifikasi Baru">
              <FiBell />
              <span className="influency-bell-dot" />
            </div>

            <div className="influency-user-pill">
              <div className="influency-user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  (user?.name?.[0] || 'A').toUpperCase()
                )}
              </div>
              <div className="influency-user-meta">
                <span className="influency-user-welcome">Selamat datang kembali</span>
                <span className="influency-user-name">{user?.name || 'Super Admin'}</span>
              </div>
              <FiChevronDown style={{ color: 'var(--text-muted)', fontSize: 14 }} />
            </div>
          </div>
        </div>

        {/* ════ Main Content Canvas ════ */}
        <div className="main-content">
          
          {/* ════ 4 Top Stat Cards (Reference Row) ════ */}
          <div className="influency-grid-4">
            
            {/* Card 1: Electric Lime Hero Card */}
            <div className="stat-card-lime">
              <div className="stat-card-top">
                <div className="stat-card-icon-pill">
                  <FiDollarSign />
                </div>
                <button className="stat-card-arrow-btn" title="Lihat Rincian">
                  <FiArrowUpRight />
                </button>
              </div>
              <div>
                <div className="stat-card-val">
                  <AnimatedNumber value={stats?.balance || 7850000} formatType="rupiah" />
                </div>
                <div className="stat-card-lbl">Bulan ini (Oktober 2026)</div>
              </div>
            </div>

            {/* Card 2: White Card (Goal / Target) */}
            <div className="stat-card-white">
              <div className="stat-card-top">
                <div className="stat-card-icon-pill">
                  <FiTarget />
                </div>
                <button className="stat-card-arrow-btn" title="Target Donasi">
                  <FiArrowUpRight />
                </button>
              </div>
              <div>
                <div className="stat-card-val">
                  <AnimatedNumber value={85} formatType="percent" /> <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Rp 8,5jt / Rp 10jt</span>
                </div>
                <div className="stat-card-lbl">Target Kas & Iuran Terpenuhi</div>
              </div>
            </div>

            {/* Card 3: White Card (Total Members) */}
            <div className="stat-card-white">
              <div className="stat-card-top">
                <div className="stat-card-icon-pill">
                  <FiUsers />
                </div>
                <button className="stat-card-arrow-btn" title="Daftar Mahasiswa">
                  <FiArrowUpRight />
                </button>
              </div>
              <div>
                <div className="stat-card-val">
                  <AnimatedNumber value={stats?.usersCount || 38} /> <span className="stat-card-subpill">+8 Baru</span>
                </div>
                <div className="stat-card-lbl">Mahasiswa Terdata Aktif</div>
              </div>
            </div>

            {/* Card 4: White Card (All Time Turnover) */}
            <div className="stat-card-white">
              <div className="stat-card-top">
                <div className="stat-card-icon-pill">
                  <FiCreditCard />
                </div>
                <button className="stat-card-arrow-btn" title="Total Histori">
                  <FiArrowUpRight />
                </button>
              </div>
              <div>
                <div className="stat-card-val">
                  <AnimatedNumber value={totalTurnover > 0 ? totalTurnover : 18234000} formatType="rupiah" />
                </div>
                <div className="stat-card-lbl">Total Perputaran Kas Global</div>
              </div>
            </div>

          </div>

          {/* ════ 2-Column Main Section (Statistics & Visitors) ════ */}
          <div className="influency-main-row">
            
            {/* Left Column: Statistics Chart Card */}
            <div className="influency-statistics-card">
              <div className="influency-card-header">
                <div className="influency-card-title">
                  <FiBarChart2 style={{ fontSize: 18 }} />
                  <span>Statistik Keuangan</span>
                </div>
                <div className="influency-card-controls">
                  <div className="influency-pill-select" onClick={() => setChartMode(chartMode === 'Monthly' ? 'Quarterly' : 'Monthly')}>
                    <span>{chartMode}</span>
                    <FiChevronDown style={{ fontSize: 12 }} />
                  </div>
                  <div className="influency-small-circle-btn" title="Filter Data">
                    <FiSliders />
                  </div>
                </div>
              </div>

              {/* Sub-Metrics Row */}
              <div className="influency-submetrics-row">
                <div className="influency-metric-block">
                  <span className="influency-metric-label">Pemasukan</span>
                  <span className="influency-metric-val">
                    {fmt(stats?.totalIncome || 11450000)}
                  </span>
                  <span className="influency-growth-badge">
                    <FiTrendingUp /> 4.1% vs Bulan Lalu
                  </span>
                </div>

                <div className="influency-metric-block">
                  <span className="influency-metric-label">Pengeluaran</span>
                  <span className="influency-metric-val">
                    {fmt(stats?.totalExpense || 3600000)}
                  </span>
                  <span className="influency-growth-badge">
                    <FiTrendingUp /> 2% vs Bulan Lalu
                  </span>
                </div>
              </div>

              {/* Recharts Alternating Rounded Bar Chart */}
              <div style={{ width: '100%', height: 230, marginTop: 'auto' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={8}>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}
                    />
                    <YAxis hide />
                    <Tooltip content={<InfluencyTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    {/* Alternating soft pastel blue & electric lime bars */}
                    <Bar
                      dataKey="expense"
                      fill="#93c5fd"
                      radius={[10, 10, 10, 10]}
                      maxBarSize={22}
                    />
                    <Bar
                      dataKey="income"
                      fill="#d4ff00"
                      radius={[10, 10, 10, 10]}
                      maxBarSize={22}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Column: Visitors / Distribution Card */}
            <div className="influency-visitors-card">
              <div className="influency-card-header">
                <div className="influency-card-title">
                  <FiUsers style={{ fontSize: 18 }} />
                  <span>Distribusi Anggota</span>
                </div>
                <div className="influency-pill-select">
                  <span>Bulan Ini</span>
                  <FiChevronDown style={{ fontSize: 12 }} />
                </div>
              </div>

              {/* Bubble Graphic */}
              <div className="influency-bubble-stage">
                {/* Big Lime Bubble */}
                <div className="bubble-lime">
                  <span className="bubble-lime-val">2,3k</span>
                  <span className="bubble-lime-lbl">Mahasiswa</span>
                </div>

                {/* Overlapping Blue Bubble */}
                <div className="bubble-blue">
                  <span className="bubble-blue-val">1,2k</span>
                  <span className="bubble-blue-lbl">Pengurus & UKM</span>
                </div>

                {/* Floating White Badge Bubble */}
                <div className="bubble-white">
                  <span className="bubble-white-val">982</span>
                  <span className="bubble-white-lbl">Pendaftar</span>
                </div>
              </div>

              {/* Target Progress Bars */}
              <div className="influency-progress-list">
                <div className="influency-progress-row">
                  <div className="influency-progress-header">
                    <span>Partisipasi Iuran Kas</span>
                    <span className="influency-progress-percent">92%</span>
                  </div>
                  <div className="influency-bar-track">
                    <div className="influency-bar-fill-lime" style={{ width: '92%' }} />
                  </div>
                </div>

                <div className="influency-progress-row">
                  <div className="influency-progress-header">
                    <span>Kehadiran Presensi Kegiatan</span>
                    <span className="influency-progress-percent">67%</span>
                  </div>
                  <div className="influency-bar-track">
                    <div className="influency-bar-fill-blue" style={{ width: '67%' }} />
                  </div>
                </div>

                <div className="influency-progress-row">
                  <div className="influency-progress-header">
                    <span>Verifikasi KTM & Berkas</span>
                    <span className="influency-progress-percent">54%</span>
                  </div>
                  <div className="influency-bar-track">
                    <div className="influency-bar-fill-gray" style={{ width: '54%' }} />
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* ════ 4 UKM STMIK Lombok Cards Strip ════ */}
          <div className="influency-card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Unit Kegiatan Mahasiswa Resmi
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Organisasi binaan resmi kampus STMIK Lombok
                </p>
              </div>
              <Link to="/admin/ukm" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                Kelola Semua UKM <FiArrowUpRight />
              </Link>
            </div>

            <div className="influency-ukm-grid">
              {filteredUkms.slice(0, 4).map(ukm => (
                <div key={ukm.id} className="influency-ukm-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {ukm.name?.slice(4, 6).toUpperCase() || 'UK'}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#16a34a', padding: '3px 9px', borderRadius: 999 }}>
                        Aktif
                      </span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{ukm.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Pembina: {ukm.manager}</div>
                  </div>

                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Kas Tersedia</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{fmt(ukm.balance)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Anggota</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{ukm.membersCount} mhs</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════ Recent Activity / Audit Log Table ════ */}
          <div className="influency-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Aktivitas Transaksi Kas Terkini
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Log pencatatan transaksi masuk dan keluar 4 UKM
                </p>
              </div>
              <div className="influency-pill-select">
                <FiFilter style={{ fontSize: 12 }} />
                <span>Semua UKM</span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>Keterangan</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>UKM</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>Tipe</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, desc: 'Iuran Kas Rutin Anggota', ukm: 'UKM Techcode', type: 'income', amount: 150000 },
                    { id: 2, desc: 'Pembelian Tali Karmantel & Carabiner', ukm: 'UKM Gumpala', type: 'expense', amount: 480000 },
                    { id: 3, desc: 'Uang Pendaftaran Lomba Coding', ukm: 'UKM Techcode', type: 'expense', amount: 250000 },
                    { id: 4, desc: 'Sponsorship Acara Musik Akustik', ukm: 'UKM Ceria', type: 'income', amount: 1200000 },
                    { id: 5, desc: 'Sewa Lapangan Futsal Latihan', ukm: 'UKM Haluner', type: 'expense', amount: 120000 },
                  ].map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{tx.desc}</td>
                      <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{tx.ukm}</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: tx.type === 'income' ? '#dcfce7' : '#fee2e2',
                          color: tx.type === 'income' ? '#16a34a' : '#dc2626'
                        }}>
                          {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td style={{ padding: '14px', fontWeight: 800, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: tx.type === 'income' ? '#16a34a' : 'var(--text-primary)' }}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
