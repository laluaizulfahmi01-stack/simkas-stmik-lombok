// src/pages/student/KasPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import {
  MdSearch, MdDownload, MdPrint, MdAccountBalance, MdClose,
  MdNorthEast, MdSavings, MdPeople, MdTrendingUp, MdBarChart,
  MdPieChart, MdTune, MdNotificationsNone, MdKeyboardArrowDown,
  MdArrowDownward, MdArrowUpward, MdCalendarToday
} from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const monthNames = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'Mei', '06': 'Jun', '07': 'Jul', '08': 'Agu',
  '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des'
};

export default function StudentKasPage() {
  const { user, activeUkmId, setActiveUkmId } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [reportModal, setReportModal] = useState(false);
  const [allUkmData, setAllUkmData] = useState({});
  const ukms = user?.ukms || [];

  useEffect(() => {
    if (!activeUkmId && ukms.length > 0) {
      setActiveUkmId(ukms[0].id);
    }
  }, [activeUkmId, ukms, setActiveUkmId]);

  // Load summaries & mini-charts for all UKMs
  useEffect(() => {
    if (!ukms.length) return;
    Promise.all(
      ukms.map(u =>
        Promise.all([
          api.get(`/transactions/${u.id}`).catch(() => ({ data: [] })),
          api.get(`/transactions/${u.id}/monthly`).catch(() => ({ data: [] })),
          api.get(`/ukm/${u.id}/stats`).catch(() => ({ data: {} })),
        ]).then(([txRes, moRes, stRes]) => ({
          ukmId: u.id,
          ukmName: u.name,
          transactions: txRes.data || [],
          monthly: moRes.data || [],
          stats: stRes.data || {},
        }))
      )
    ).then(results => {
      const map = {};
      results.forEach(res => {
        map[res.ukmId] = res;
      });
      setAllUkmData(map);
    });
  }, [ukms]);

  useEffect(() => {
    const idToUse = activeUkmId || ukms[0]?.id;
    if (!idToUse) return;
    setLoading(true);
    Promise.all([
      api.get(`/transactions/${idToUse}`),
      api.get(`/transactions/${idToUse}/monthly`).catch(() => ({ data: [] })),
      api.get(`/ukm/${idToUse}/stats`).catch(() => ({ data: {} }))
    ]).then(([txRes, monthlyRes, statsRes]) => {
      setTransactions(txRes.data || []);
      setMonthlyData(monthlyRes.data || []);
      setStats(statsRes.data || { totalIncome: 0, totalExpense: 0, balance: 0 });
    }).catch(() => {
      setTransactions([]);
      setMonthlyData([]);
    }).finally(() => setLoading(false));
  }, [activeUkmId]);

  const activeUkm = ukms.find(u => u.id === activeUkmId) || ukms[0];
  const fmt = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

  const formatShortRupiah = val => {
    const n = Math.abs(Number(val) || 0);
    const prefix = Number(val) < 0 ? '-' : '';
    if (n >= 1000000) return prefix + 'Rp ' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return prefix + 'Rp ' + Math.round(n / 1000) + 'k';
    return prefix + 'Rp ' + n.toLocaleString('id-ID');
  };

  // Filter transactions
  const filtered = transactions.filter(t => {
    const matchDesc = (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchCat = categoryFilter === 'all' || t.category === categoryFilter;
    return matchDesc && matchType && matchCat;
  });

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Format Recharts data with Indonesian short months
  const formattedChartData = monthlyData.map(d => {
    const parts = (d.month || '').split('-');
    const m = parts[1] || '';
    const label = monthNames[m] || d.month || '-';
    return {
      ...d,
      label,
      income: Number(d.income || 0),
      expense: Number(d.expense || 0),
    };
  });

  // Custom Black Pill Tooltip (Influency Reference Style)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const inc = payload.find(p => p.dataKey === 'income')?.value || 0;
      const exp = payload.find(p => p.dataKey === 'expense')?.value || 0;
      return (
        <div style={{
          background: '#09090b',
          color: '#ffffff',
          padding: '8px 14px',
          borderRadius: 12,
          boxShadow: '0 14px 32px rgba(0,0,0,0.45)',
          fontSize: 12,
          textAlign: 'center',
          minWidth: 130,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#d4ff00', letterSpacing: -0.3 }}>
            {fmt(inc)}
          </div>
          <div style={{ fontSize: 10, color: '#a1a1aa', marginTop: 2 }}>
            Bulan {label}
          </div>
          <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4, borderTop: '1px solid #27272a', paddingTop: 4 }}>
            Keluar: <span style={{ color: '#93c5fd', fontWeight: 700 }}>{fmt(exp)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['No', 'Tanggal', 'Keterangan', 'Kategori', 'Jenis', 'Nominal (Rp)'];
    const rows = filtered.map((t, idx) => [
      idx + 1,
      t.date,
      `"${(t.description || '-').replace(/"/g, '""')}"`,
      t.category || '-',
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.amount
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Kas_${activeUkm?.name || 'UKM'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Influency-Style Top Header Bar */}
        <div className="pro-header-bar">
          <div className="pro-header-title-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 className="pro-page-title">Catatan Kas</h1>
              <span className="pro-title-pill-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: ukms.length ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)', color: 'var(--text-primary)', borderColor: ukms.length ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: ukms.length ? '#22c55e' : '#f59e0b', display: 'inline-block' }}></span>
                {ukms.length ? (activeUkm?.name ? `${activeUkm.name} • Anggota Aktif` : 'Kas Terbuka UKM') : 'Akses Terbatas: Khusus Anggota Resmi'}
              </span>
            </div>
            <p className="pro-page-subtitle">
              Pantau seluruh rincian dan transparansi arus kas UKM Anda secara terbuka
            </p>
          </div>

          <div className="pro-header-actions-block">
            <div className="pro-user-pill">
              <div className="pro-user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  (user?.name?.[0] || 'U').toUpperCase()
                )}
              </div>
              <div className="pro-user-text">
                <span className="pro-user-welcome">Mahasiswa</span>
                <span className="pro-user-name">{user?.name || 'Mahasiswa'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* JIKA BELUM RESMI DITERIMA: TAMPILKAN PROTEKSI RAMAH */}
        {!ukms.length ? (
          <div className="main-content">
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                maxWidth: 620,
                margin: '40px auto',
                borderRadius: 24,
                boxShadow: '0 12px 36px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 34,
                  margin: '0 auto 18px',
                }}
              >
                🔒
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, color: 'var(--text-primary)' }}>
                Buku Kas Hanya untuk Anggota Resmi
              </h2>

              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                Sesuai aturan transparansi kampus STMIK Lombok, laporan uang kas dan pembukuan hanya dapat diakses oleh mahasiswa yang telah <strong>resmi diterima</strong> menjadi anggota UKM.
                <br /><br />
                Status akun Anda saat ini sedang dalam <strong>tahap seleksi / matrikulasi</strong>. Setelah pengelola UKM menerima pengajuan Anda, akses kas akan terbuka secara otomatis.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Link
                  to="/student"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, fontWeight: 700 }}
                >
                  Pantau Status Seleksi & Matrikulasi →
                </Link>
                <Link
                  to="/student/pendaftaran"
                  className="btn btn-ghost"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, fontWeight: 700 }}
                >
                  Detail Pengajuan UKM
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Subbar with UKM tabs (if multi) & Action buttons */}
            <div className="pro-subbar" style={{ display: 'flex', justifyContent: ukms.length > 1 ? 'space-between' : 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {ukms.length > 1 && (
            <div className="ukm-switcher">
              {ukms.map(u => (
                <button
                  key={u.id}
                  className={`ukm-tab${(activeUkmId || ukms[0]?.id) === u.id ? ' active' : ''}`}
                  onClick={() => setActiveUkmId(u.id)}
                >
                  {u.name}
                </button>
              ))}
            </div>
          )}

          <div className="pro-subbar-actions" style={{ marginLeft: ukms.length > 1 ? 'auto' : 0 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setReportModal(true)} style={{ borderRadius: 999, fontWeight: 600 }}>
              <MdPrint /> Pratinjau Rekap
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={exportCSV}
              style={{ background: '#09090b', borderColor: '#09090b', color: '#fff', borderRadius: 999, padding: '8px 20px', fontWeight: 600 }}
            >
              <MdDownload /> Unduh Data (CSV)
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* ════ 4 Top Stat Cards (Influency Style) ════ */}
          <div className="pro-dashboard-grid-4">
            {/* Card 1: Lime Hero Card */}
            <div className="pro-stat-card lime-hero">
              <div className="pro-card-top">
                <div className="pro-icon-box">
                  <MdAccountBalance />
                </div>
                <div className="pro-arrow-circle">
                  <MdNorthEast />
                </div>
              </div>
              <div>
                <div className="pro-stat-val">{fmt(balance)}</div>
                <div className="pro-stat-lbl">Saldo Kas Tersedia</div>
                <div className="pro-stat-sub">↗ Kas Terbuka {activeUkm?.name}</div>
              </div>
            </div>

            {/* Card 2: Target Kas */}
            <div className="pro-stat-card">
              <div className="pro-card-top">
                <div className="pro-icon-box" style={{ background: 'rgba(204, 247, 38, 0.25)', color: '#65a30d' }}>
                  <MdSavings />
                </div>
                <div className="pro-arrow-circle">
                  <MdNorthEast />
                </div>
              </div>
              <div>
                <div className="pro-stat-val" style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  88% <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Target Kas</span>
                </div>
                <div className="pro-stat-lbl">Realisasi Kas Anggota</div>
                <div className="pro-stat-sub">{fmt(totalIncome)} terkumpul</div>
              </div>
            </div>

            {/* Card 3: Keaktifan Anggota */}
            <div className="pro-stat-card">
              <div className="pro-card-top">
                <div className="pro-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                  <MdPeople />
                </div>
                <div className="pro-arrow-circle">
                  <MdNorthEast />
                </div>
              </div>
              <div>
                <div className="pro-stat-val" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  38 <span className="badge badge-blue" style={{ fontSize: 11, padding: '2px 8px' }}>+6 Baru</span>
                </div>
                <div className="pro-stat-lbl">Mahasiswa Terdata</div>
                <div className="pro-stat-sub">Kontribusi Iuran Aktif</div>
              </div>
            </div>

            {/* Card 4: Total Perputaran Kas */}
            <div className="pro-stat-card">
              <div className="pro-card-top">
                <div className="pro-icon-box" style={{ background: 'rgba(147, 197, 253, 0.25)', color: '#2563eb' }}>
                  <MdTrendingUp />
                </div>
                <div className="pro-arrow-circle">
                  <MdNorthEast />
                </div>
              </div>
              <div>
                <div className="pro-stat-val">{fmt(totalIncome + totalExpense)}</div>
                <div className="pro-stat-lbl">Total Perputaran Kas</div>
                <div className="pro-stat-sub">Histori 6 Bulan Terbuka</div>
              </div>
            </div>
          </div>

          {/* ════ Main 2-Column Section (65% & 35%) ════ */}
          <div className="pro-main-grid">
            {/* Left Column: Bar Chart Statistics */}
            <div className="pro-analytics-card">
              <div className="pro-header-wrap">
                <div className="pro-title-group">
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: 20 }}>
                    <MdBarChart />
                  </div>
                  <div>
                    <h3>Grafik Arus Kas Bulanan</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                      Perbandingan pemasukan vs pengeluaran 6 bulan terakhir
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="pro-pill-btn active">Bulanan</span>
                  <button className="pro-pill-btn" onClick={() => setReportModal(true)}>
                    <MdTune /> Filter
                  </button>
                </div>
              </div>

              {/* Submetrics Row */}
              <div className="pro-submetrics">
                <div>
                  <div className="pro-submetric-label">Total Pemasukan</div>
                  <div className="pro-submetric-val">
                    {fmt(totalIncome)}
                    <span className="pro-badge-trend positive">
                      <MdNorthEast style={{ fontSize: 12 }} /> +14.2%
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>vs periode sebelumnya</span>
                </div>

                <div>
                  <div className="pro-submetric-label">Total Pengeluaran</div>
                  <div className="pro-submetric-val">
                    {fmt(totalExpense)}
                    <span className="pro-badge-trend neutral">
                      5.1% efisien
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>penggunaan dana UKM</span>
                </div>
              </div>

              {/* Recharts Bar Chart */}
              <div className="pro-main-chart-wrap" style={{ height: 260, marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedChartData} barGap={6} margin={{ top: 12, right: 10, left: -6, bottom: 2 }}>
                    <XAxis
                      dataKey="label"
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={44}
                      tickFormatter={v => (v >= 1000 ? Math.round(v / 1000) + 'k' : v)}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Bar
                      dataKey="income"
                      name="Pemasukan"
                      fill="#d4ff00"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={22}
                    />
                    <Bar
                      dataKey="expense"
                      name="Pengeluaran"
                      fill="#93c5fd"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={22}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 14, fontSize: 12, fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 12, background: '#d4ff00', borderRadius: 4 }}></span> Pemasukan Kas
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 12, background: '#93c5fd', borderRadius: 4 }}></span> Pengeluaran Kas
                </span>
              </div>
            </div>

            {/* Right Column: Allocation & Targets (Influency Visitors Style) */}
            <div className="pro-analytics-card">
              <div className="pro-header-wrap">
                <div className="pro-title-group">
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(212,255,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#09090b', fontSize: 20 }}>
                    <MdPieChart />
                  </div>
                  <div>
                    <h3>Distribusi & Target Kas</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Alokasi dana {activeUkm?.name}</p>
                  </div>
                </div>
                <span className="pro-pill-btn">Semester Gasal ⌵</span>
              </div>

              {/* Overlapping Bubbles with crystal clear visibility */}
              <div className="pro-bubbles-wrap">
                <div className="pro-bubble lime">
                  <div className="pro-bubble-val">{formatShortRupiah(totalIncome)}</div>
                  <div className="pro-bubble-lbl">Pemasukan</div>
                </div>
                <div className="pro-bubble blue">
                  <div className="pro-bubble-val">{formatShortRupiah(totalExpense)}</div>
                  <div className="pro-bubble-lbl">Pengeluaran</div>
                </div>
                <div className="pro-bubble slate">
                  <div className="pro-bubble-val">{formatShortRupiah(balance)}</div>
                  <div className="pro-bubble-lbl">Sisa Kas</div>
                </div>
              </div>

              {/* Proportional Ratio Bar */}
              <div style={{ marginTop: 10, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Komposisi Arus Dana</span>
                  <span>{totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}% Saldo Likuid</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-base)', overflow: 'hidden', display: 'flex', border: '1px solid var(--border)' }}>
                  <div
                    style={{
                      width: `${totalIncome + totalExpense > 0 ? Math.max(10, Math.min(90, Math.round((totalIncome / (totalIncome + totalExpense)) * 100))) : 50}%`,
                      background: '#d4ff00',
                      transition: 'width 0.4s ease'
                    }}
                    title={`Pemasukan: ${fmt(totalIncome)}`}
                  />
                  <div
                    style={{
                      width: `${totalIncome + totalExpense > 0 ? Math.max(10, Math.min(90, Math.round((totalExpense / (totalIncome + totalExpense)) * 100))) : 50}%`,
                      background: '#93c5fd',
                      transition: 'width 0.4s ease'
                    }}
                    title={`Pengeluaran: ${fmt(totalExpense)}`}
                  />
                </div>
              </div>

              {/* Progress Target Rows */}
              <div className="pro-target-list">
                <div className="pro-target-item">
                  <div className="pro-target-head">
                    <span>Target Iuran Anggota</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>92%</span>
                  </div>
                  <div className="pro-target-bar">
                    <div className="pro-target-fill" style={{ width: '92%', background: '#d4ff00' }}></div>
                  </div>
                </div>

                <div className="pro-target-item">
                  <div className="pro-target-head">
                    <span>Kebutuhan Operasional</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>67%</span>
                  </div>
                  <div className="pro-target-bar">
                    <div className="pro-target-fill" style={{ width: '67%', background: '#93c5fd' }}></div>
                  </div>
                </div>

                <div className="pro-target-item">
                  <div className="pro-target-head">
                    <span>Dana Cadangan & Workshop</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>54%</span>
                  </div>
                  <div className="pro-target-bar">
                    <div className="pro-target-fill" style={{ width: '54%', background: '#cbd5e1' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ════ Table & Filter Card ════ */}
          <div className="card" style={{ borderRadius: 24 }}>
            <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>Riwayat Pembukuan Transaksi</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                  Seluruh rincian uang kas dapat diaudit dan dilihat oleh setiap anggota mahasiswa.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setReportModal(true)} style={{ borderRadius: 999 }}>
                  <MdPrint /> Pratinjau
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={exportCSV}
                  style={{ background: '#09090b', borderColor: '#09090b', color: '#fff', borderRadius: 999 }}
                >
                  <MdDownload /> Unduh Data (CSV)
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="kas-filter-container">
              <div className="kas-filter-search">
                <MdSearch className="search-icon" />
                <input
                  type="text"
                  id="search-kas-input"
                  className="input"
                  placeholder="Cari transaksi kas..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 38, height: 40, fontSize: 13, background: 'var(--bg-surface)' }}
                />
              </div>

              <select
                className="input kas-filter-select"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="all">Semua Tipe</option>
                <option value="income">↓ Pemasukan</option>
                <option value="expense">↑ Pengeluaran</option>
              </select>

              <select
                className="input kas-filter-select"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="all">Semua Kategori</option>
                <option value="iuran">Iuran Anggota</option>
                <option value="operasional">Operasional</option>
                <option value="kegiatan">Kegiatan & Lomba</option>
                <option value="dana_hibah">Dana Hibah</option>
                <option value="sponsorship">Sponsorship</option>
              </select>

              {(search || typeFilter !== 'all' || categoryFilter !== 'all') && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setSearch('');
                    setTypeFilter('all');
                    setCategoryFilter('all');
                  }}
                  style={{ fontSize: 12 }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Transactions View: Desktop Table + Mobile Cards */}
            {loading ? (
              <div className="empty-state"><div className="icon">⏳</div><p>Memuat transaksi kas...</p></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="icon">💸</div>
                <p>Tidak ada transaksi kas yang sesuai.</p>
              </div>
            ) : (
              <>
                {/* 1. Desktop Full Table View */}
                <div className="table-wrap desktop-table-only">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tanggal</th>
                        <th>Keterangan / Uraian</th>
                        <th>Kategori</th>
                        <th>Tipe Kas</th>
                        <th>Jumlah Nominal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((t, idx) => (
                        <tr key={t.id}>
                          <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                          <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                            {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ fontWeight: 600 }}>{t.description || '-'}</td>
                          <td>
                            <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                              {t.category || (t.type === 'income' ? 'iuran' : 'operasional')}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${t.type === 'income' ? 'badge-green' : 'badge-red'}`}>
                              {t.type === 'income' ? '↓ Masuk' : '↑ Keluar'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 800, color: t.type === 'income' ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
                            {t.type === 'income' ? '+ ' : '- '}{fmt(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 2. Mobile Clean Cards View (Full Description, Zero Truncation) */}
                <div className="mobile-cards-only">
                  <div className="mobile-tx-cards-list">
                    {filtered.map((t) => (
                      <div key={t.id} className="mobile-tx-card">
                        <div className="mobile-tx-card-top">
                          <div className={`mobile-tx-icon-pill ${t.type}`}>
                            {t.type === 'income' ? <MdArrowDownward /> : <MdArrowUpward />}
                          </div>
                          <div className="mobile-tx-info">
                            <div className="mobile-tx-desc">{t.description || '-'}</div>
                            <div className="mobile-tx-meta-row">
                              <span className="mobile-tx-date">
                                <MdCalendarToday style={{ marginRight: 4, fontSize: 12 }} />
                                {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="badge badge-gray" style={{ textTransform: 'capitalize', fontSize: 10, padding: '2px 8px' }}>
                                {t.category || (t.type === 'income' ? 'iuran' : 'operasional')}
                              </span>
                            </div>
                          </div>
                          <div className={`mobile-tx-nominal ${t.type}`}>
                            {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                          </div>
                        </div>

                        <div className="mobile-tx-card-bottom">
                          <span className={`badge ${t.type === 'income' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 11, padding: '3px 10px' }}>
                            {t.type === 'income' ? '📈 Pemasukan Kas' : '📉 Pengeluaran Kas'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        </>
      )}
      </div>

      {/* Report Modal */}
      {reportModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setReportModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3>Pratinjau Laporan Transparansi Kas</h3>
              <button className="modal-close" onClick={() => setReportModal(false)}><MdClose /></button>
            </div>
            <div style={{ background: '#ffffff', color: '#0f172a', padding: 20, borderRadius: 12, border: '1px solid #cbd5e1' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 10, marginBottom: 15 }}>
                <h4 style={{ margin: 0, textTransform: 'uppercase' }}>LAPORAN ARUS KAS {activeUkm?.name}</h4>
                <div style={{ fontSize: 11, color: '#64748b' }}>STMIK Lombok &bull; Rekapitulasi Mahasiswa</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 15, textAlign: 'center' }}>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Pemasukan</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a' }}>{fmt(totalIncome)}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Pengeluaran</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#dc2626' }}>{fmt(totalExpense)}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Saldo Bersih</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#2563eb' }}>{fmt(balance)}</div>
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: 20 }}>
                <button className="btn btn-ghost" onClick={() => setReportModal(false)}>Tutup</button>
                <button className="btn btn-primary" onClick={() => window.print()} style={{ background: '#0f172a', borderColor: '#0f172a' }}>
                  <MdPrint /> Cetak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
