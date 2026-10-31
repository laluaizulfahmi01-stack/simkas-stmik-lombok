// src/pages/student/StudentDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import NotificationModal from '../../components/NotificationModal';
import EventBannerCarousel from '../../components/EventBannerCarousel';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  FiArrowUpRight, FiCheckCircle, FiUsers,
  FiBookOpen, FiCalendar, FiSearch, FiBell, FiChevronDown,
  FiAward, FiFileText, FiUploadCloud, FiInfo, FiArrowRight,
  FiCreditCard, FiCompass, FiShield, FiUserPlus, FiActivity,
  FiTrendingUp, FiSliders, FiDollarSign, FiTarget,
  FiRefreshCw, FiClock
} from 'react-icons/fi';

export default function StudentDashboard() {
  const { user, updateUser, activeUkmId, setActiveUkmId } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [availableUkms, setAvailableUkms] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [profRes, appsRes, pubEvRes] = await Promise.all([
        api.get('/profile').catch(() => null),
        api.get('/applications/my').catch(() => ({ data: [] })),
        api.get('/events/public').catch(() => ({ data: [] })),
      ]);
      if (profRes?.data && updateUser) {
        updateUser(profRes.data);
        if (profRes.data.ukms?.length > 0) {
          setActiveUkmId(profRes.data.ukms[0].id);
        }
      }
      if (appsRes?.data) {
        setMyApps(appsRes.data);
      }
      if (pubEvRes?.data && pubEvRes.data.length > 0) {
        setEvents(pubEvRes.data);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const ukms = user?.ukms || [];
  const activeUkm = ukms.find(u => u.id === activeUkmId) || ukms[0];

  useEffect(() => {
    if (!activeUkmId && ukms.length > 0) {
      setActiveUkmId(ukms[0].id);
    }
  }, [activeUkmId, ukms, setActiveUkmId]);

  useEffect(() => {
    if (ukms.length > 0) {
      const idToUse = activeUkmId || ukms[0]?.id;
      if (!idToUse) return;
      setLoading(true);
      Promise.all([
        api.get(`/ukm/${idToUse}/stats`),
        api.get(`/transactions/${idToUse}`),
        api.get(`/ukm/${idToUse}/achievements`),
        api.get('/applications/my').catch(() => ({ data: [] })),
        api.get(`/events/${idToUse}`).catch(() => ({ data: [] })),
        api.get('/events/public').catch(() => ({ data: [] })),
      ])
        .then(([statsRes, txRes, achRes, appsRes, evRes, pubEvRes]) => {
          setStats(statsRes.data);
          setRecent(txRes.data.slice(0, 5));
          setAchievements(achRes.data.slice(0, 3));
          setMyApps(appsRes.data);
          const ukmEvs = evRes.data || [];
          const pubEvs = pubEvRes?.data || [];
          const merged = [...ukmEvs];
          pubEvs.forEach(pe => {
            if (!merged.some(e => e.id === pe.id)) merged.push(pe);
          });
          setEvents(merged.length > 0 ? merged : pubEvs);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(true);
      Promise.all([
        api.get('/ukm'),
        api.get('/applications/my').catch(() => ({ data: [] })),
        api.get('/events/public').catch(() => ({ data: [] })),
      ])
        .then(([ukmRes, appsRes, evRes]) => {
          setAvailableUkms(ukmRes.data);
          setMyApps(appsRes.data);
          setEvents(evRes?.data || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [activeUkmId, ukms.length]);

  const fmt = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

  const chartData = [
    { month: 'Mei', expense: 85000, income: 120000 },
    { month: 'Jun', expense: 95000, income: 180000 },
    { month: 'Jul', expense: 110000, income: 140000 },
    { month: 'Agu', expense: 130000, income: 210000 },
    { month: 'Sep', expense: 160000, income: 250000 },
  ];

  const InfluencyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="influency-dark-tooltip">
          <div className="tooltip-val">{fmt(payload[1]?.value || payload[0]?.value)}</div>
          <div className="tooltip-sub">{label} • Kas Masuk</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* ════ INFLUENCY Top Header Bar ════ */}
        <div className="influency-header">
          <div className="influency-header-left">
            <div className="influency-title-row">
              <h1 className="influency-page-title">Beranda Mahasiswa</h1>
              <span
                className="influency-pill-badge"
                style={{
                  background: ukms.length ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  borderColor: ukms.length ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                }}
              >
                {ukms.length === 0 ? '⏳ Calon Anggota (Menunggu Seleksi)' : `${ukms.length} UKM Diikuti`}
              </span>
            </div>
            <p className="influency-page-sub">
              NIM: <strong>{user?.nim}</strong> &bull; {user?.prodi || 'Sistem Informasi'} &bull; STMIK Lombok
            </p>
          </div>

          <div className="influency-header-right">
            <Link
              to="/student/pendaftaran"
              className="influency-pill-badge influency-reg-btn"
              style={{ textDecoration: 'none', background: '#f8fafc', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: 700 }}
            >
              <FiUserPlus style={{ marginRight: 6 }} /> <span className="influency-btn-text">Pendaftaran UKM</span>
            </Link>

            <div className="influency-circle-btn" title="Cari Data">
              <FiSearch />
            </div>
            <div
              className="influency-circle-btn"
              title="Pusat Notifikasi SIMKAS"
              onClick={() => setNotifModalOpen(true)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
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
                <span className="influency-user-welcome">Selamat Datang</span>
                <span className="influency-user-name">{user?.name || 'Mahasiswa'}</span>
              </div>
              <FiChevronDown style={{ color: 'var(--text-muted)', fontSize: 14 }} />
            </div>
          </div>
        </div>

        {/* ════ Main Content Area ════ */}
        <div className="main-content">
          
          {/* =========================================================================
              VIEW 1: ONBOARDING / MENUNGGU PERSETUJUAN PENGELOLA UKM
             ========================================================================= */}
          {ukms.length === 0 ? (
            <div>
              {/* Event & Agenda Banner Carousel (Auto-rotating every 5 seconds) */}
              {events.length > 0 && (
                <EventBannerCarousel
                  events={events}
                  activeUkmName="Agenda Kampus STMIK Lombok"
                  autoIntervalMs={5000}
                />
              )}

              {myApps && myApps.length > 0 ? (
                /* ════ Menunggu Persetujuan Pengelola UKM Hero Section ════ */
                <div style={{ marginBottom: 24 }}>
                  <div className="waiting-hero-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      <div style={{ maxWidth: 660 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid #fde68a', padding: '4px 14px', borderRadius: 999, marginBottom: 12 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} className="status-pulse-amber" />
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#b45309', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                            PENDAFTARAN AWAL BERHASIL DIAJUKAN
                          </span>
                        </div>

                        <h2 className="waiting-hero-title" style={{ fontSize: 24, fontWeight: 900, margin: 0, color: '#78350f', letterSpacing: -0.5 }}>
                          Halo, {user?.name}! Menunggu Persetujuan Pengelola UKM ⏳
                        </h2>
                        <p className="waiting-hero-desc" style={{ margin: '8px 0 0', fontSize: 14, color: '#92400e', lineHeight: 1.6 }}>
                          Permohonan bergabung Anda telah berhasil terdaftar di SIMKAS. Saat ini formulir dan berkas Anda
                          <strong> sedang dalam peninjauan & verifikasi oleh Pengelola masing-masing UKM</strong>.
                          Setelah disetujui, hak akses penuh (buku kas, presensi kegiatan, e-book) akan terbuka secara otomatis.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={refreshData}
                          disabled={isRefreshing}
                          style={{
                            background: '#ffffff',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            borderRadius: 999,
                            padding: '10px 18px',
                            fontWeight: 800,
                            fontSize: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            cursor: isRefreshing ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <FiRefreshCw style={{ animation: isRefreshing ? 'simkasSpin 0.8s linear infinite' : 'none' }} />
                          <span>{isRefreshing ? 'Memeriksa...' : 'Segarkan Status'}</span>
                        </button>

                        <Link
                          to="/student/pendaftaran"
                          style={{
                            background: '#78350f',
                            color: '#ffffff',
                            padding: '10px 20px',
                            borderRadius: 999,
                            fontWeight: 800,
                            fontSize: 12,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span>Detail Pendaftaran</span>
                          <FiArrowUpRight />
                        </Link>
                      </div>
                    </div>

                    {/* 3 Steps Live Tracker */}
                    <div className="waiting-steps-grid">
                      <div style={{ background: 'rgba(255,255,255,0.7)', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span>✓</span> LANGKAH 1 (SELESAI)
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#78350f' }}>Registrasi Akun</div>
                        <div style={{ fontSize: 11, color: '#92400e', marginTop: 2 }}>Akun & berkas KTM tersimpan di sistem</div>
                      </div>

                      <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 14, border: '2px solid #f59e0b', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.12)' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span className="status-pulse-amber" style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                          LANGKAH 2 (SEDANG BERJALAN)
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#78350f' }}>Review Pengelola UKM</div>
                        <div style={{ fontSize: 11, color: '#92400e', marginTop: 2 }}>Pengelola sedang meninjau formulir pendaftaran</div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.4)', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span>⏳</span> LANGKAH 3 (SELANJUTNYA)
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#78350f' }}>Aktivasi Anggota Resmi</div>
                        <div style={{ fontSize: 11, color: '#92400e', marginTop: 2 }}>Akses kas, presensi & e-book terbuka otomatis</div>
                      </div>
                    </div>
                  </div>

                  {/* Application Detail Cards */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Permohonan UKM yang Sedang Diproses ({myApps.length}/2 Kuota)
                    </h3>
                    {myApps.length < 2 && (
                      <Link
                        to="/student/pendaftaran"
                        style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        + Daftar UKM Pilihan Ke-2 &rarr;
                      </Link>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {myApps.map((app, idx) => {
                      const isPending = ['diajukan', 'dalam_seleksi'].includes(app.status);
                      return (
                        <div
                          key={app.id || idx}
                          className="card"
                          style={{
                            borderRadius: 20,
                            padding: 20,
                            border: isPending ? '1.5px solid #fde68a' : '1px solid var(--border)',
                            background: 'var(--bg-surface)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                                PERMOHONAN #{idx + 1}
                              </span>
                              <h4 style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                                {app.ukm?.name || 'UKM STMIK Lombok'}
                              </h4>
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                padding: '4px 10px',
                                borderRadius: 999,
                                background: app.status === 'diterima' ? '#dcfce7' : app.status === 'dalam_seleksi' ? '#ede9fe' : '#fef3c7',
                                color: app.status === 'diterima' ? '#15803d' : app.status === 'dalam_seleksi' ? '#6d28d9' : '#b45309',
                              }}
                            >
                              {app.status === 'diterima' ? '✓ Diterima' : app.status === 'dalam_seleksi' ? '🔍 Dalam Seleksi' : '⏳ Menunggu Review Pengelola'}
                            </span>
                          </div>

                          <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Motivasi Pendaftaran:</div>
                            <div style={{ fontStyle: 'italic', lineHeight: 1.4 }}>
                              "{app.motivation || 'Pendaftaran awal saat registrasi akun mahasiswa.'}"
                            </div>
                          </div>

                          {app.managerNote && (
                            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '8px 12px', fontSize: 12, color: '#065f46', marginBottom: 12 }}>
                              <strong>Pesan Pengelola:</strong> {app.managerNote}
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                            <span>Tanggal: {new Date(app.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span style={{ color: user?.isVerified ? '#15803d' : '#d97706', fontWeight: 700 }}>
                              {user?.isVerified ? '✓ KTM Terverifikasi' : '📄 KTM Ditinjau'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ════ Jadwal Matrikulasi, Seleksi & Syarat Kelulusan (Dynamic per UKM) ════ */}
                  {myApps.map((app, appIdx) => {
                    const u = app.ukm;
                    let schedRows = [];
                    if (u?.matriculationSchedule) {
                      if (Array.isArray(u.matriculationSchedule)) {
                        schedRows = u.matriculationSchedule;
                      } else {
                        try { schedRows = JSON.parse(u.matriculationSchedule); } catch { schedRows = []; }
                      }
                    }
                    const isOpen = Boolean(u?.registrationOpen);
                    const openCloseStr = isOpen
                      ? (u?.registrationCloseDate ? `Pendaftaran Dibuka s/d ${new Date(u.registrationCloseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Pendaftaran Dibuka (Aktif)')
                      : 'Pendaftaran Ditutup';
                    const notes = u?.matriculationNotes || 'Hadir tepat waktu, membawa KTM fisik atau surat aktif kampus, dan berpakaian rapi mengenakan jas almamater.';

                    return (
                      <div
                        key={app.id || appIdx}
                        className="card"
                        style={{
                          borderRadius: 24,
                          padding: '24px 26px',
                          marginBottom: 24,
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          border: '1.5px solid #cbd5e1',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                        }}
                      >
                        {/* Header Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                              <FiCalendar />
                            </div>
                            <div>
                              <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
                                Jadwal & Rundown Matrikulasi Calon Anggota: {u?.name || 'UKM STMIK Lombok'}
                              </h3>
                              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                                Status Pendaftaran: <strong>{openCloseStr}</strong> • Ditentukan oleh Pengelola {u?.name}
                              </p>
                            </div>
                          </div>

                          <span
                            style={{
                              fontSize: 12,
                              padding: '6px 16px',
                              borderRadius: 999,
                              fontWeight: 800,
                              background: isOpen ? '#dcfce7' : '#fee2e2',
                              color: isOpen ? '#15803d' : '#991b1b',
                            }}
                          >
                            {isOpen ? '📢 Gelombang Seleksi Aktif' : '⚪ Pendaftaran Ditutup'}
                          </span>
                        </div>

                        {/* TABEL JADWAL MATRIKULASI (Bisa Seminggu Penuh / Multi-Hari) */}
                        <div style={{ marginBottom: 18 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                              📋 Rundown Sesi Matrikulasi ({schedRows.length > 0 ? `${schedRows.length} Hari Terjadwal` : 'Menunggu Jadwal Lengkap'})
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              Wajib diikuti minimal 80% kehadiran
                            </span>
                          </div>

                          {schedRows.length > 0 ? (
                            <div className="table-wrap" style={{ borderRadius: 14, border: '1.5px solid #e2e8f0', overflowX: 'auto', background: '#ffffff' }}>
                              <table style={{ width: '100%', minWidth: 780, borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 800, color: '#475569', width: 100 }}>Hari</th>
                                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 800, color: '#475569', width: 140 }}>Tanggal</th>
                                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 800, color: '#475569', width: 150 }}>Waktu / Jam</th>
                                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 800, color: '#475569' }}>Materi & Agenda Sesi</th>
                                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 800, color: '#475569', width: 170 }}>Lokasi / Lab</th>
                                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 800, color: '#475569', width: 150 }}>Pemateri / PJ</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {schedRows.map((row, rIdx) => {
                                    const rowDateStr = row.date
                                      ? new Date(row.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
                                      : '-';
                                    return (
                                      <tr
                                        key={rIdx}
                                        style={{
                                          borderBottom: rIdx === schedRows.length - 1 ? 'none' : '1px solid #f1f5f9',
                                          background: rIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                                        }}
                                      >
                                        <td style={{ padding: '11px 14px' }}>
                                          <span
                                            style={{
                                              display: 'inline-block',
                                              padding: '4px 10px',
                                              borderRadius: 8,
                                              background: '#eff6ff',
                                              color: '#1d4ed8',
                                              fontWeight: 800,
                                              fontSize: 11.5,
                                            }}
                                          >
                                            {row.day || `Hari ${rIdx + 1}`}
                                          </span>
                                        </td>
                                        <td style={{ padding: '11px 14px', fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>
                                          {rowDateStr}
                                        </td>
                                        <td style={{ padding: '11px 14px', fontSize: 12.5, color: '#475569' }}>
                                          {row.time || '09:00 - 12:00 WITA'}
                                        </td>
                                        <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                                          {row.agenda || '-'}
                                        </td>
                                        <td style={{ padding: '11px 14px', fontSize: 12.5, color: '#475569' }}>
                                          📍 {row.location || 'Kampus STMIK'}
                                        </td>
                                        <td style={{ padding: '11px 14px', fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>
                                          {row.instructor || '-'}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: 14, border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                              <p style={{ margin: 0, fontSize: 13 }}>
                                Jadwal rincian tabel matrikulasi sedang dirumuskan oleh pengelola {u?.name}. Pantau berkala di halaman ini.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Syarat & Catatan Kelulusan */}
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 14, padding: '14px 18px' }}>
                          <div style={{ fontWeight: 800, fontSize: 13, color: '#1e3a8a', marginBottom: 6 }}>
                            📌 Syarat & Catatan Khusus Pengelola {u?.name}:
                          </div>
                          <p style={{ margin: 0, fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
                            {notes}
                          </p>
                          <div style={{ marginTop: 10, fontSize: 12, color: '#2563eb', fontWeight: 700 }}>
                            *Setelah dinyatakan diterima oleh pengelola UKM, akun Anda otomatis aktif sebagai Anggota Penuh dan menu Transparansi Kas serta Presensi akan terbuka.
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Hero Lime Onboarding Banner when 0 applications */
                <div
                  style={{
                    background: 'var(--lime-hero)',
                    borderRadius: 24,
                    padding: '28px 32px',
                    marginBottom: 24,
                    color: '#09090b',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 20,
                    boxShadow: '0 6px 20px -4px rgba(212, 255, 0, 0.4)',
                  }}
                >
                  <div style={{ maxWidth: 640 }}>
                    <span
                      style={{
                        background: '#09090b',
                        color: '#ffffff',
                        padding: '4px 12px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.5,
                        display: 'inline-block',
                        marginBottom: 10,
                      }}
                    >
                      PENDAFTARAN AWAL UKM
                    </span>
                    <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>
                      Halo, {user?.name}! 👋
                    </h2>
                    <p style={{ margin: '8px 0 0', fontSize: 14, color: '#1e293b', lineHeight: 1.6 }}>
                      Sistem Informasi Manajemen UKM (SIMKAS) STMIK Lombok adalah portal resmi pendaftaran awal
                      (<em>Open Recruitment</em>) bagi mahasiswa untuk bergabung dengan Unit Kegiatan Mahasiswa pilihan.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Link
                      to="/student/pendaftaran"
                      style={{
                        background: '#09090b',
                        color: '#ffffff',
                        padding: '12px 24px',
                        borderRadius: 999,
                        fontWeight: 800,
                        fontSize: 13,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <FiUserPlus /> Daftar UKM Sekarang
                    </Link>
                    <Link
                      to="/student/pendaftaran"
                      style={{
                        background: '#ffffff',
                        color: '#09090b',
                        padding: '12px 22px',
                        borderRadius: 999,
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: 'none',
                        border: '1px solid rgba(0,0,0,0.08)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <FiUploadCloud /> Cek Status KTM
                    </Link>
                  </div>
                </div>
              )}

              {/* 3 Steps Guide */}
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: 'var(--text-primary)' }}>
                Alur Pendaftaran Awal UKM Kampus
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div className="card" style={{ borderRadius: 24, padding: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                      <FiShield style={{ fontSize: 18 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>LANGKAH 01</span>
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>Verifikasi KTM Mahasiswa</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 14px' }}>
                    Unggah foto Kartu Tanda Mahasiswa untuk verifikasi identitas resmi kampus.
                  </p>
                  <div>
                    {user?.isVerified ? (
                      <span className="badge badge-green">✓ Terverifikasi</span>
                    ) : (
                      <span className="badge badge-yellow">Menunggu Review</span>
                    )}
                  </div>
                </div>

                <div className="card" style={{ borderRadius: 24, padding: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                      <FiCompass style={{ fontSize: 18 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>LANGKAH 02</span>
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>Pilih & Ajukan Pendaftaran</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 14px' }}>
                    Pilih hingga maksimal 2 UKM resmi yang sedang membuka gelombang pendaftaran.
                  </p>
                  <Link to="/student/pendaftaran" style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Katalog UKM <FiArrowRight />
                  </Link>
                </div>

                <div className="card" style={{ borderRadius: 24, padding: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ecfccb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f6212' }}>
                      <FiCheckCircle style={{ fontSize: 18 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>LANGKAH 03</span>
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>Resmi Jadi Anggota</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 14px' }}>
                    Pengelola UKM meninjau pendaftaran. Setelah diterima, akses modul dan kas terbuka otomatis.
                  </p>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Akses kas & presensi aktif</span>
                </div>
              </div>

              {/* Rekomendasi 4 UKM Kampus */}
              <div className="card" style={{ borderRadius: 24, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>4 UKM Resmi STMIK Lombok</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>Pilih organisasi minat & bakat yang ingin Anda ikuti</p>
                  </div>
                  <Link to="/student/pendaftaran" className="btn btn-primary btn-sm" style={{ borderRadius: 999, background: '#09090b', borderColor: '#09090b', color: '#fff' }}>
                    Lihat Semua
                  </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  {availableUkms.map(u => (
                    <div
                      key={u.id}
                      style={{
                        background: 'var(--bg-subtle)',
                        borderRadius: 18,
                        padding: 18,
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{u.name}</h4>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 999,
                              background: u.registrationOpen ? '#dcfce7' : '#f1f5f9',
                              color: u.registrationOpen ? '#15803d' : '#64748b',
                            }}
                          >
                            {u.registrationOpen ? 'Open Recruitment' : 'Tutup'}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 14px' }}>
                          {u.description?.slice(0, 100)}...
                        </p>
                      </div>

                      <Link
                        to="/student/pendaftaran"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'var(--bg-surface)',
                          borderRadius: 12,
                          color: 'var(--text-primary)',
                          fontWeight: 700,
                          fontSize: 13,
                          textDecoration: 'none',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <span>Daftar Sekarang</span>
                        <FiArrowUpRight style={{ fontSize: 16 }} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================================
                VIEW 2: ENROLLED STUDENT (MEMBER RESMI UKM)
               ========================================================================= */
            <>
              {/* UKM Switcher Bar */}
              <div className="influency-switcher-bar">
                <div className="ukm-switcher">
                  {ukms.map(u => (
                    <button
                      key={u.id}
                      className={`ukm-tab${activeUkmId === u.id ? ' active' : ''}`}
                      onClick={() => setActiveUkmId(u.id)}
                    >
                      {u.name}
                    </button>
                  ))}
                </div>

                <div className="influency-switcher-actions">
                  {ukms.length < 2 && (
                    <Link
                      to="/student/pendaftaran"
                      className="btn btn-ghost btn-sm"
                      style={{ borderRadius: 999, fontSize: 12, fontWeight: 700 }}
                    >
                      + Daftar UKM Ke-2 ({ukms.length}/2)
                    </Link>
                  )}
                  <Link
                    to="/student/kas"
                    className="btn btn-primary btn-sm"
                    style={{
                      background: '#09090b',
                      borderColor: '#09090b',
                      color: '#ffffff',
                      borderRadius: 999,
                      padding: '8px 18px',
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <FiCreditCard /> Buka Kas {activeUkm?.name}
                  </Link>
                </div>
              </div>

              {/* Event & Agenda Banner Carousel (Auto-rotating every 5 seconds) */}
              {events.length > 0 && (
                <EventBannerCarousel
                  events={events}
                  activeUkmName={activeUkm?.name}
                  autoIntervalMs={5000}
                />
              )}

              {/* ════ 4 Stat Cards Row (INFLUENCY Matching) ════ */}
              <div className="influency-grid-4">
                
                {/* Card 1: Electric Lime Hero */}
                <div className="stat-card-lime">
                  <div className="stat-card-top">
                    <div className="stat-card-icon-pill">
                      <FiCreditCard />
                    </div>
                    <Link to="/student/kas" className="stat-card-arrow-btn" title="Kas UKM">
                      <FiArrowUpRight />
                    </Link>
                  </div>
                  <div>
                    <div className="stat-card-val">{fmt(stats?.balance)}</div>
                    <div className="stat-card-lbl">Saldo Kas {activeUkm?.name}</div>
                  </div>
                </div>

                {/* Card 2: Attendance Rate */}
                <div className="stat-card-white">
                  <div className="stat-card-top">
                    <div className="stat-card-icon-pill">
                      <FiCheckCircle />
                    </div>
                    <Link to="/student/absen" className="stat-card-arrow-btn" title="Presensi">
                      <FiArrowUpRight />
                    </Link>
                  </div>
                  <div>
                    <div className="stat-card-val">
                      100% <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>presensi</span>
                    </div>
                    <div className="stat-card-lbl">Status Kehadiran Aktif</div>
                  </div>
                </div>

                {/* Card 3: Anggota UKM */}
                <div className="stat-card-white">
                  <div className="stat-card-top">
                    <div className="stat-card-icon-pill">
                      <FiUsers />
                    </div>
                    <Link to="/student/absen" className="stat-card-arrow-btn" title="Anggota">
                      <FiArrowUpRight />
                    </Link>
                  </div>
                  <div>
                    <div className="stat-card-val">
                      {stats?.memberCount || 24} <span className="stat-card-pill-tag">+Aktif</span>
                    </div>
                    <div className="stat-card-lbl">Mahasiswa Terdaftar</div>
                  </div>
                </div>

                {/* Card 4: E-Book & Modul */}
                <div className="stat-card-white">
                  <div className="stat-card-top">
                    <div className="stat-card-icon-pill">
                      <FiBookOpen />
                    </div>
                    <Link to="/student/capaian" className="stat-card-arrow-btn" title="Modul">
                      <FiArrowUpRight />
                    </Link>
                  </div>
                  <div>
                    <div className="stat-card-val">{achievements.length || 3} Modul</div>
                    <div className="stat-card-lbl">E-Book & Panduan Resmi</div>
                  </div>
                </div>

              </div>

              {/* ════ 2-Column Main Section (Statistics & Visitors) ════ */}
              <div className="influency-main-row">
                
                {/* Left Column: Statistics Chart Card */}
                <div className="influency-statistics-card">
                  <div className="influency-card-header">
                    <div className="influency-card-title">
                      <FiActivity style={{ fontSize: 18 }} />
                      <span>Aktivitas & Perputaran Kas</span>
                    </div>
                    <div className="influency-card-controls">
                      <div className="influency-pill-select">
                        <span>Bulanan</span>
                        <FiChevronDown style={{ fontSize: 12 }} />
                      </div>
                      <div className="influency-small-circle-btn" title="Filter">
                        <FiCalendar />
                      </div>
                    </div>
                  </div>

                  {/* Sub-Metrics Row */}
                  <div className="influency-submetrics-row">
                    <div className="influency-metric-block">
                      <span className="influency-metric-label">Pemasukan UKM</span>
                      <span className="influency-metric-val">
                        {fmt(stats?.totalIncome || 1045000)}
                      </span>
                      <span className="influency-growth-badge">
                        <FiTrendingUp /> Kas Masuk Terverifikasi
                      </span>
                    </div>

                    <div className="influency-metric-block">
                      <span className="influency-metric-label">Pengeluaran UKM</span>
                      <span className="influency-metric-val">
                        {fmt(stats?.totalExpense || 585000)}
                      </span>
                      <span className="influency-growth-badge" style={{ color: '#dc2626', background: 'rgba(220, 38, 38, 0.08)' }}>
                        ↘ Kas Operasional
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

                {/* Right Column: Partisipasi Mahasiswa Bubbles */}
                <div className="influency-visitors-card">
                  <div className="influency-card-header">
                    <div className="influency-card-title">
                      <FiUsers style={{ fontSize: 18 }} />
                      <span>Partisipasi Mahasiswa</span>
                    </div>
                    <div className="influency-pill-select">
                      <span>Semester Ini</span>
                      <FiChevronDown style={{ fontSize: 12 }} />
                    </div>
                  </div>

                  {/* Bubble Graphic */}
                  <div className="influency-bubble-stage">
                    <div className="bubble-lime">
                      <span className="bubble-lime-val">98%</span>
                      <span className="bubble-lime-lbl">Kehadiran</span>
                    </div>

                    <div className="bubble-blue">
                      <span className="bubble-blue-val">12x</span>
                      <span className="bubble-blue-lbl">Kegiatan</span>
                    </div>

                    <div className="bubble-white">
                      <span className="bubble-white-val">4</span>
                      <span className="bubble-white-lbl">Modul</span>
                    </div>
                  </div>

                  {/* Progress Target Bars */}
                  <div className="influency-progress-list">
                    <div className="influency-progress-row">
                      <div className="influency-progress-header">
                        <span>Presensi Kegiatan</span>
                        <span className="influency-progress-percent">98%</span>
                      </div>
                      <div className="influency-bar-track">
                        <div className="influency-bar-fill-lime" style={{ width: '98%' }} />
                      </div>
                    </div>

                    <div className="influency-progress-row">
                      <div className="influency-progress-header">
                        <span>Iuran Kas Wajib</span>
                        <span className="influency-progress-percent">100%</span>
                      </div>
                      <div className="influency-bar-track">
                        <div className="influency-bar-fill-blue" style={{ width: '100%' }} />
                      </div>
                    </div>

                    <div className="influency-progress-row">
                      <div className="influency-progress-header">
                        <span>Pembelajaran E-Book</span>
                        <span className="influency-progress-percent">75%</span>
                      </div>
                      <div className="influency-bar-track">
                        <div className="influency-bar-fill-gray" style={{ width: '75%' }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* ════ Fast Action 4 Grid ════ */}
              <div className="fast-action-grid">
                <Link
                  to="/student/kas"
                  className="card fast-action-card"
                  style={{
                    borderRadius: 20,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="fast-action-icon" style={{ background: '#ecfccb', color: '#3f6212', width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    <FiCreditCard />
                  </div>
                  <div className="fast-action-info">
                    <div className="fast-action-title" style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>Catatan Kas</div>
                    <div className="fast-action-sub" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pemasukan & Biaya</div>
                  </div>
                </Link>

                <Link
                  to="/student/absen"
                  className="card fast-action-card"
                  style={{
                    borderRadius: 20,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="fast-action-icon" style={{ background: '#dbeafe', color: '#1d4ed8', width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    <FiCheckCircle />
                  </div>
                  <div className="fast-action-info">
                    <div className="fast-action-title" style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>Presensi Absen</div>
                    <div className="fast-action-sub" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Check-in Hari Ini</div>
                  </div>
                </Link>

                <Link
                  to="/student/capaian"
                  className="card fast-action-card"
                  style={{
                    borderRadius: 20,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="fast-action-icon" style={{ background: '#fef3c7', color: '#b45309', width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    <FiBookOpen />
                  </div>
                  <div className="fast-action-info">
                    <div className="fast-action-title" style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>E-Book & Modul</div>
                    <div className="fast-action-sub" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Materi Pembelajaran</div>
                  </div>
                </Link>

                <Link
                  to="/student/sejarah"
                  className="card fast-action-card"
                  style={{
                    borderRadius: 20,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="fast-action-icon" style={{ background: '#ede9fe', color: '#6d28d9', width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    <FiAward />
                  </div>
                  <div className="fast-action-info">
                    <div className="fast-action-title" style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>Sejarah & Visi</div>
                    <div className="fast-action-sub" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Profil Organisasi</div>
                  </div>
                </Link>
              </div>

              {/* ════ Recent Kas Transactions ════ */}
              <div className="card" style={{ borderRadius: 24, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Transaksi Kas Terbaru</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Arsip transparansi keuangan {activeUkm?.name}</p>
                  </div>
                  <Link to="/student/kas" className="btn btn-ghost btn-sm" style={{ borderRadius: 999 }}>
                    Lihat Semua
                  </Link>
                </div>

                {recent.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)' }}>
                    <p>Belum ada riwayat transaksi kas.</p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>Keterangan</th>
                          <th>Tipe</th>
                          <th>Nominal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map(t => (
                          <tr key={t.id}>
                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.date}</td>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.description || '-'}</td>
                            <td>
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 999,
                                  fontSize: 11,
                                  fontWeight: 800,
                                  background: t.type === 'income' ? '#ecfccb' : '#fee2e2',
                                  color: t.type === 'income' ? '#3f6212' : '#991b1b',
                                }}
                              >
                                {t.type === 'income' ? '↓ Masuk' : '↑ Keluar'}
                              </span>
                            </td>
                            <td style={{ fontWeight: 800, color: t.type === 'income' ? '#15803d' : '#b91c1c' }}>
                              {t.type === 'income' ? '+ ' : '- '} {fmt(t.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ════ Agenda & Event Kegiatan UKM ({activeUkm?.name}) ════ */}
              <div className="card" style={{ borderRadius: 24, padding: 24, marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiCalendar style={{ color: 'var(--primary)', fontSize: 20 }} />
                      <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        Agenda & Event Kegiatan ({activeUkm?.name})
                      </h3>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      Jadwal workshop, latihan rutin, pertemuan, dan kegiatan resmi UKM
                    </p>
                  </div>
                  <span className="badge badge-blue" style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, fontWeight: 700 }}>
                    {events.length} Agenda Terjadwal
                  </span>
                </div>

                {events.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)' }}>
                    <p>Belum ada agenda kegiatan yang dijadwalkan untuk {activeUkm?.name}.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {events.map(ev => {
                      const evDate = new Date(ev.startTime);
                      return (
                        <div
                          key={ev.id}
                          style={{
                            background: 'var(--bg-subtle, #f8fafc)',
                            border: '1px solid var(--border)',
                            borderRadius: 18,
                            padding: '18px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  padding: '3px 8px',
                                  borderRadius: 999,
                                  background: ev.visibility === 'publik' ? '#eff6ff' : '#f5f3ff',
                                  color: ev.visibility === 'publik' ? '#1d4ed8' : '#6d28d9',
                                }}
                              >
                                {ev.visibility === 'publik' ? '🌐 Event Terbuka / Publik' : '🔒 Internal Anggota'}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: ev.status === 'terlaksana' ? '#16a34a' : '#d97706',
                                }}
                              >
                                {ev.status === 'terlaksana' ? '✓ Selesai' : '⏳ Direncanakan'}
                              </span>
                            </div>
                            <h4 style={{ fontSize: 15, fontWeight: 800, margin: '4px 0 6px', color: 'var(--text-primary)' }}>
                              {ev.title}
                            </h4>
                            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
                              {ev.description || 'Kegiatan resmi diselenggarakan oleh pengelola UKM.'}
                            </p>
                          </div>

                          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <FiClock style={{ fontSize: 13, color: 'var(--primary)' }} />
                              <span>
                                {evDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} • {evDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 13 }}>📍</span>
                              <span>{ev.location || 'Kampus STMIK Lombok'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>

      {/* Pusat Notifikasi Interaktif Multi-Device */}
      <NotificationModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
      />
    </div>
  );
}
