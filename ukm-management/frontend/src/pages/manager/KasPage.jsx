// src/pages/manager/KasPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { useToast } from '../../components/Toast';
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdPrint, MdDownload,
  MdSearch, MdFilterList, MdNorthEast, MdAccountBalance,
  MdSavings, MdPeople, MdTrendingUp, MdBarChart, MdPieChart,
  MdTune, MdCalendarMonth, MdNotificationsNone, MdKeyboardArrowDown,
  MdArrowDownward, MdArrowUpward, MdCalendarToday
} from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EMPTY = {
  amount: '',
  description: '',
  type: 'income',
  category: 'iuran',
  date: new Date().toISOString().split('T')[0]
};

const monthNames = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'Mei', '06': 'Jun', '07': 'Jul', '08': 'Agu',
  '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des'
};

export default function ManagerKasPage() {
  const { user } = useAuth();
  const [ukms, setUkms] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [allUkmData, setAllUkmData] = useState({});
  const [modal, setModal] = useState(false);
  const [lpjModal, setLpjModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const toast = useToast();

  const fmt = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

  const formatShortRupiah = val => {
    const n = Math.abs(Number(val) || 0);
    const prefix = Number(val) < 0 ? '-' : '';
    if (n >= 1000000) return prefix + 'Rp ' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return prefix + 'Rp ' + Math.round(n / 1000) + 'k';
    return prefix + 'Rp ' + n.toLocaleString('id-ID');
  };

  // Load UKMs strictly scoped to manager (or all if superadmin)
  useEffect(() => {
    api.get('/ukm').then(r => {
      const all = r.data || [];
      const isSuper = user?.role === 'superadmin';
      const mine = all.filter(u => Number(u.managerId) === Number(user?.id));
      const targetList = isSuper ? all : mine;
      setUkms(targetList);
      if (targetList.length) setActiveId(targetList[0].id);
    }).catch(err => {
      console.error(err);
      setUkms([]);
    });
  }, [user]);

  // Load per-UKM summaries and mini-charts for all UKMs
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
    ).then(resList => {
      const map = {};
      resList.forEach(item => { map[item.ukmId] = item; });
      setAllUkmData(map);
    });
  }, [ukms]);

  // Load active UKM transactions & monthly chart
  const load = () => {
    if (!activeId) return;
    setLoading(true);
    Promise.all([
      api.get(`/transactions/${activeId}`),
      api.get(`/transactions/${activeId}/monthly`)
    ])
      .then(([txRes, monthlyRes]) => {
        setTransactions(txRes.data || []);
        setChartData(monthlyRes.data || []);
      })
      .catch(() => {
        setTransactions([]);
        setChartData([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [activeId]);

  const activeUkm = ukms.find(u => u.id === activeId) || ukms[0];

  const openAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setModal(true);
  };

  const openEdit = t => {
    setForm({
      amount: t.amount,
      description: t.description || '',
      type: t.type,
      category: t.category || (t.type === 'income' ? 'iuran' : 'operasional'),
      date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setEditId(t.id);
    setModal(true);
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      return toast('Nominal transaksi harus lebih dari 0', 'error');
    }
    try {
      if (editId) {
        await api.put(`/transactions/${activeId}/${editId}`, form);
        toast('Transaksi kas berhasil diperbarui! ✏️', 'success');
      } else {
        await api.post(`/transactions/${activeId}`, form);
        toast('Transaksi kas berhasil dicatat! 💰', 'success');
      }
      setModal(false);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal menyimpan transaksi', 'error');
    }
  };

  const remove = async id => {
    if (!confirm('Yakin ingin membatalkan/menghapus catatan transaksi ini?')) return;
    try {
      await api.delete(`/transactions/${activeId}/${id}`);
      toast('Transaksi berhasil dihapus 🗑️', 'success');
      load();
    } catch {
      toast('Gagal menghapus transaksi', 'error');
    }
  };

  // Filter transactions
  const filtered = transactions.filter(t => {
    const matchDesc = (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchStart = !startDate || new Date(t.date) >= new Date(startDate);
    const matchEnd = !endDate || new Date(t.date) <= new Date(endDate);
    return matchDesc && matchType && matchCategory && matchStart && matchEnd;
  });

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Format Recharts data with Indonesian short months
  const formattedChartData = chartData.map(d => {
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

  // Custom Black Pill Tooltip (matching reference image)
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

  // Export to CSV
  const exportCSV = () => {
    const headers = ['No', 'Tanggal', 'Keterangan', 'Kategori', 'Tipe', 'Nominal (Rp)'];
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
    link.setAttribute('download', `LPJ_Kas_${activeUkm?.name || 'UKM'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Laporan CSV berhasil diunduh! 📥', 'success');
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Influency-Style Top Header Bar */}
        <div className="pro-header-bar">
          <div className="pro-header-title-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 className="pro-page-title">Kelola Kas</h1>
              <span className="pro-title-pill-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34, 197, 94, 0.12)', color: 'var(--text-primary)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                {activeUkm?.name ? `${activeUkm.name} • Pengelola Resmi` : 'Pengelola UKM'}
              </span>
            </div>
            <p className="pro-page-subtitle">
              Pembukuan resmi & transparansi perputaran kas {activeUkm?.name || 'UKM Binaan'}
            </p>
          </div>

          <div className="pro-header-actions-block">
            <div
              className="pro-circle-btn"
              title="Cari Transaksi"
              onClick={() => document.getElementById('search-kas-input-manager')?.focus()}
            >
              <MdSearch />
            </div>
            <div className="pro-circle-btn" title="Notifikasi Kas">
              <MdNotificationsNone />
              <span className="pro-bell-dot"></span>
            </div>
            <div className="pro-user-pill">
              <div className="pro-user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  (user?.name?.[0] || 'M').toUpperCase()
                )}
              </div>
              <div className="pro-user-text">
                <span className="pro-user-welcome">Pengelola Kas</span>
                <span className="pro-user-name">{user?.name || 'Pengelola UKM'}</span>
              </div>
              <MdKeyboardArrowDown style={{ color: 'var(--text-muted)', fontSize: 18 }} />
            </div>
          </div>
        </div>

        {/* Subbar with UKM tabs (if multi) & Action buttons */}
        <div className="pro-subbar" style={{ display: 'flex', justifyContent: ukms.length > 1 ? 'space-between' : 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {ukms.length > 1 && (
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
          )}

          <div className="pro-subbar-actions" style={{ marginLeft: ukms.length > 1 ? 'auto' : 0 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setLpjModal(true)} style={{ borderRadius: 999, fontWeight: 600 }}>
              <MdPrint /> Ekspor LPJ
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={openAdd}
              style={{ background: '#09090b', borderColor: '#09090b', color: '#fff', borderRadius: 999, padding: '8px 20px', fontWeight: 600 }}
            >
              <MdAdd /> Catat Transaksi
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* ════ 4 Top Stat Cards (Influency Style from Reference) ════ */}
          <div className="pro-dashboard-grid-4">
            {/* Card 1: Lime Hero Highlight Card */}
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
                <div className="pro-stat-sub">↗ Likuiditas Aktif {activeUkm?.name}</div>
              </div>
            </div>

            {/* Card 2: Target Kas & Iuran */}
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
                <div className="pro-stat-lbl">Realisasi Anggaran UKM</div>
                <div className="pro-stat-sub">{fmt(totalIncome)} terkumpul</div>
              </div>
            </div>

            {/* Card 3: Anggota Berkontribusi */}
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
                <div className="pro-stat-lbl">Anggota Terdata Kas</div>
                <div className="pro-stat-sub">Tertib Iuran Semester Gasal</div>
              </div>
            </div>

            {/* Card 4: Total Akumulasi Arus Kas */}
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
                <div className="pro-stat-sub">Akumulasi Pembukuan 6 Bulan</div>
              </div>
            </div>
          </div>

          {/* ════ Main 2-Column Analytics Section (65% & 35%) ════ */}
          <div className="pro-main-grid">
            {/* Left Column: Bar Chart Statistics */}
            <div className="pro-analytics-card">
              <div className="pro-header-wrap">
                <div className="pro-title-group">
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: 20 }}>
                    <MdBarChart />
                  </div>
                  <div>
                    <h3>Statistik Arus Kas Bulanan</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                      Perbandingan pemasukan vs pengeluaran 6 bulan terakhir
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="pro-pill-btn active">Bulanan</span>
                  <button className="pro-pill-btn" onClick={() => setLpjModal(true)}>
                    <MdTune /> Filter Laporan
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
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>realisasi operasional UKM</span>
                </div>
              </div>

              {/* Recharts Bar Chart (Matching Reference Style) */}
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

            {/* Right Column: Allocation & Targets (Influency Visitors style) */}
            <div className="pro-analytics-card">
              <div className="pro-header-wrap">
                <div className="pro-title-group">
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(212,255,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#09090b', fontSize: 20 }}>
                    <MdPieChart />
                  </div>
                  <div>
                    <h3>Alokasi & Target Kas</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Komposisi dana {activeUkm?.name}</p>
                  </div>
                </div>
                <span className="pro-pill-btn">Semester Gasal ⌵</span>
              </div>

              {/* Overlapping Circles/Bubbles with crystal clear visibility */}
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
                    <span>Alokasi Kebutuhan Operasional</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>67%</span>
                  </div>
                  <div className="pro-target-bar">
                    <div className="pro-target-fill" style={{ width: '67%', background: '#93c5fd' }}></div>
                  </div>
                </div>

                <div className="pro-target-item">
                  <div className="pro-target-head">
                    <span>Target Dana Kegiatan & Workshop</span>
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
            <div className="kas-table-header-row">
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>Catatan Transaksi Buku Kas</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                  Menampilkan {filtered.length} dari total {transactions.length} transaksi pembukuan
                </p>
              </div>

              {/* Action Buttons */}
              <div className="kas-table-actions-group">
                <button className="btn btn-ghost btn-sm" onClick={exportCSV} style={{ borderRadius: 999 }}>
                  <MdDownload /> Unduh CSV
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setLpjModal(true)} style={{ borderRadius: 999 }}>
                  <MdPrint /> Pratinjau LPJ
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={openAdd}
                  style={{ background: '#09090b', borderColor: '#09090b', color: '#fff', borderRadius: 999 }}
                >
                  <MdAdd /> Catat Transaksi
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="kas-filter-container">
              {/* Search */}
              <div className="kas-filter-search">
                <MdSearch className="search-icon" />
                <input
                  type="text"
                  id="search-kas-input-manager"
                  className="input"
                  placeholder="Cari uraian transaksi..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 38, height: 40, fontSize: 13, background: 'var(--bg-surface)' }}
                />
              </div>

              {/* Type Filter */}
              <select
                className="input kas-filter-select"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="all">Semua Jenis</option>
                <option value="income">↓ Pemasukan</option>
                <option value="expense">↑ Pengeluaran</option>
              </select>

              {/* Category Filter */}
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

              {/* Date Filters */}
              <div className="kas-filter-date-row">
                <input
                  type="date"
                  className="input kas-date-input"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  title="Dari Tanggal"
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>s/d</span>
                <input
                  type="date"
                  className="input kas-date-input"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  title="Sampai Tanggal"
                />
              </div>

              {(search || typeFilter !== 'all' || categoryFilter !== 'all' || startDate || endDate) && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setSearch('');
                    setTypeFilter('all');
                    setCategoryFilter('all');
                    setStartDate('');
                    setEndDate('');
                  }}
                  style={{ fontSize: 12 }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Transactions View: Desktop Table + Mobile Cards */}
            {loading ? (
              <div className="empty-state"><div className="icon">⏳</div><p>Memuat catatan transaksi kas...</p></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="icon">💸</div>
                <p>{transactions.length === 0 ? 'Belum ada catatan kas untuk UKM ini.' : 'Tidak ada transaksi yang cocok dengan filter.'}</p>
              </div>
            ) : (
              <>
                {/* 1. Desktop Tabular View */}
                <div className="table-wrap desktop-table-only">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tanggal</th>
                        <th>Uraian / Keterangan</th>
                        <th>Kategori</th>
                        <th>Jenis Kas</th>
                        <th>Jumlah Nominal</th>
                        <th>Aksi</th>
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
                              {t.type === 'income' ? '↓ Pemasukan' : '↑ Pengeluaran'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 800, color: t.type === 'income' ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
                            {t.type === 'income' ? '+ ' : '- '}{fmt(t.amount)}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)} title="Edit Transaksi">
                                <MdEdit />
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => remove(t.id)} title="Hapus Transaksi">
                                <MdDelete />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 2. Mobile Clean Cards View (No Horizontal Overflow or Truncation) */}
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
                            {t.type === 'income' ? '↓ Pemasukan Kas' : '↑ Pengeluaran Kas'}
                          </span>
                          <div className="mobile-tx-btn-group">
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)} style={{ borderRadius: 8, padding: '4px 10px', fontSize: 12 }}>
                              <MdEdit /> Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => remove(t.id)} style={{ borderRadius: 8, padding: '4px 10px', fontSize: 12 }}>
                              <MdDelete /> Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Input / Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Catatan Transaksi' : 'Catat Transaksi Kas Baru'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Jenis Transaksi</label>
                <select
                  className="input"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  <option value="income">Pemasukan Kas (+)</option>
                  <option value="expense">Pengeluaran Kas (-)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Kategori Kas</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  <option value="iuran">Iuran Anggota</option>
                  <option value="operasional">Kebutuhan Operasional</option>
                  <option value="kegiatan">Kegiatan & Lomba</option>
                  <option value="dana_hibah">Dana Hibah Kampus</option>
                  <option value="sponsorship">Sponsorship / Donasi</option>
                </select>
              </div>

              <div className="form-group">
                <label>Jumlah Nominal (Rp)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="Contoh: 50000"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Uraian / Keterangan Transaksi</label>
                <input
                  className="input"
                  placeholder="Contoh: Iuran Kas Anggota Bulan Oktober"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required
                />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {[
                    'Iuran Kas Anggota',
                    'Dana Hibah Kampus',
                    'Konsumsi Pertemuan',
                    'Sewa Fasilitas / Lapangan',
                    'Pembelian Perlengkapan',
                    'Sponsorship'
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setForm({ ...form, description: preset })}
                      style={{
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        padding: '2px 8px',
                        fontSize: 11,
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tanggal Transaksi</label>
                <input
                  className="input"
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#0f172a', borderColor: '#0f172a' }}>
                  {editId ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Laporan Pertanggungjawaban (LPJ) Print & Preview Modal */}
      {lpjModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setLpjModal(false)}>
          <div className="modal" style={{ maxWidth: 760, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-blue" style={{ marginBottom: 4 }}>DOKUMEN RESMI LPJ</span>
                <h3>Laporan Pertanggungjawaban Keuangan (LPJ)</h3>
              </div>
              <button className="modal-close" onClick={() => setLpjModal(false)}><MdClose /></button>
            </div>

            {/* LPJ Printable Area */}
            <div
              id="lpj-print-content"
              style={{
                background: '#ffffff',
                color: '#0f172a',
                padding: '24px 28px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                fontFamily: 'system-ui, sans-serif'
              }}
            >
              {/* Kop Surat STMIK Lombok */}
              <div style={{ textAlign: 'center', borderBottom: '3px double #0f172a', paddingBottom: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: '#1e3a8a' }}>
                  LEMBAGA KEMAHASISWAAN STMIK LOMBOK
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', margin: '4px 0' }}>
                  UNIT KEGIATAN MAHASISWA {activeUkm?.name?.toUpperCase()}
                </div>
                <div style={{ fontSize: 11, color: '#475569' }}>
                  Jl. Basuki Rahmat No. 09, Praya, Kab. Lombok Tengah, NTB &bull; Email: kemahasiswaan@stmiklombok.ac.id
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, textDecoration: 'underline' }}>
                  LAPORAN PERTANGGUNGJAWABAN KAS & KEUANGAN
                </h4>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Periode Pembukuan: {filtered.length > 0 ? `${filtered[filtered.length - 1].date} s/d ${filtered[0].date}` : 'Semua Periode'}
                </div>
              </div>

              {/* Summary Box */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 12,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 18,
                  textAlign: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>TOTAL PEMASUKAN</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#16a34a', marginTop: 2 }}>{fmt(totalIncome)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>TOTAL PENGELUARAN</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#dc2626', marginTop: 2 }}>{fmt(totalExpense)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>SALDO KAS BERSIH</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>{fmt(balance)}</div>
                </div>
              </div>

              {/* Rincian Transaksi Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 24 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #94a3b8' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #cbd5e1' }}>No</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Tanggal</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Keterangan Transaksi</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #cbd5e1' }}>Jenis</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1' }}>Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, idx) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{t.date}</td>
                      <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{t.description || '-'}</td>
                      <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                        {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </td>
                      <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>
                        {fmt(t.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                    <td colSpan="4" style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1' }}>
                      Sisa Saldo Kas Akhir:
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #cbd5e1', color: '#2563eb' }}>
                      {fmt(balance)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Tanda Tangan Pengesahan (Signatures) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, textAlign: 'center', marginTop: 30 }}>
                <div>
                  <div style={{ fontSize: 12 }}>Mengetahui,</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Ketua / Pengelola UKM</div>
                  <div style={{ height: 60 }}></div>
                  <div style={{ fontSize: 12, fontWeight: 800, textDecoration: 'underline' }}>{user?.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>NIM/NIDN: {user?.nim}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12 }}>Praya, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>Bendahara UKM</div>
                  <div style={{ height: 60 }}></div>
                  <div style={{ fontSize: 12, fontWeight: 800, textDecoration: 'underline' }}>( Bendahara UKM )</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Pengurus Resmi STMIK Lombok</div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setLpjModal(false)}>
                Tutup
              </button>
              <button className="btn btn-ghost" onClick={exportCSV}>
                <MdDownload /> Unduh Data (CSV)
              </button>
              <button className="btn btn-primary" onClick={() => window.print()} style={{ background: '#0f172a', borderColor: '#0f172a' }}>
                <MdPrint /> Cetak Dokumen / Simpan PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
