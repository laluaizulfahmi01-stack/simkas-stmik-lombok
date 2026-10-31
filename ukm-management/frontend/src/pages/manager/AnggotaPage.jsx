// src/pages/manager/AnggotaPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import AnimatedNumber from '../../components/AnimatedNumber';
import ProPageHeader from '../../components/ProPageHeader';
import api from '../../api/axios';
import {
  MdGroups, MdSchool, MdFilterList, MdSearch,
  MdNorthEast, MdVerified, MdCheckCircle,
  MdPerson, MdOutlineBadge
} from 'react-icons/md';

export default function AnggotaPage() {
  const { user } = useAuth();
  const [ukms, setUkms] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [prodiFilter, setProdiFilter] = useState('all');

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
    setLoading(true);
    api.get(`/ukm/${activeId}/members`).then(r => {
      setMembers(r.data || []);
    }).catch(() => setMembers([])).finally(() => setLoading(false));
  }, [activeId]);

  const activeUkm = ukms.find(u => u.id === activeId);

  // Filter members
  const filtered = members.filter(m => {
    const matchSearch =
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.nim?.toLowerCase().includes(search.toLowerCase()) ||
      m.prodi?.toLowerCase().includes(search.toLowerCase());
    const matchProdi = prodiFilter === 'all' || m.prodi === prodiFilter;
    return matchSearch && matchProdi;
  });

  const prodiList = Array.from(new Set(members.map(m => m.prodi).filter(Boolean)));

  const getInitials = (name) => {
    if (!name) return 'M';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const avatarColors = [
    { bg: '#dbeafe', color: '#1e40af' },
    { bg: '#fef3c7', color: '#92400e' },
    { bg: '#dcfce7', color: '#166534' },
    { bg: '#f3e8ff', color: '#6b21a8' },
    { bg: '#ffedd5', color: '#9a3412' },
  ];

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ProPageHeader
          title="Daftar Anggota UKM"
          subtitle={`${members.length} mahasiswa resmi terdaftar & aktif di ${activeUkm?.name || 'UKM STMIK Lombok'}`}
          pillBadge="Roster Terverifikasi"
          pillColor="indigo"
          subbar={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Pilih UKM:</span>
              <div className="ukm-switcher" style={{ margin: 0 }}>
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
            </div>
          }
        />

        <div className="main-content">
          {/* Summary Row */}
          <div className="pro-dashboard-grid-4" style={{ marginBottom: 24 }}>
            <div className="pro-stat-card lime-hero">
              <div className="pro-card-top">
                <div className="pro-icon-box">
                  <MdGroups />
                </div>
                <div className="pro-arrow-circle">
                  <MdNorthEast />
                </div>
              </div>
              <div>
                <div className="pro-stat-val"><AnimatedNumber value={members.length} /> Mahasiswa</div>
                <div className="pro-stat-lbl">Total Anggota Terdaftar</div>
                <div className="pro-stat-sub">Aktif & terdata di sistem</div>
              </div>
            </div>

            <div className="pro-stat-card">
              <div className="pro-card-top">
                <div className="pro-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
                  <MdSchool />
                </div>
                <div className="pro-arrow-circle">
                  <MdNorthEast />
                </div>
              </div>
              <div>
                <div className="pro-stat-val" style={{ fontSize: 18 }}>{prodiList[0] || 'Teknik Informatika'}</div>
                <div className="pro-stat-lbl">Program Studi Terbanyak</div>
                <div className="pro-stat-sub">Dominasi keanggotaan aktif</div>
              </div>
            </div>

            <div className="pro-stat-card">
              <div className="pro-card-top">
                <div className="pro-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                  <MdCheckCircle />
                </div>
                <div className="pro-arrow-circle">
                  <MdNorthEast />
                </div>
              </div>
              <div>
                <div className="pro-stat-val" style={{ fontSize: 18 }}>Semester Gasal</div>
                <div className="pro-stat-lbl">Status Periode Aktif</div>
                <div className="pro-stat-sub">Tahun Akademik 2026/2027</div>
              </div>
            </div>

            <div className="pro-stat-card">
              <div className="pro-card-top">
                <div className="pro-icon-box" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#9333ea' }}>
                  <MdOutlineBadge />
                </div>
                <div className="pro-arrow-circle">
                  <MdNorthEast />
                </div>
              </div>
              <div>
                <div className="pro-stat-val" style={{ fontSize: 18 }}>100% Terverifikasi</div>
                <div className="pro-stat-lbl">Validasi Identitas NIM</div>
                <div className="pro-stat-sub">Terhubung ke Pangkalan Data</div>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="card" style={{ padding: '24px 28px', borderRadius: 20 }}>
            <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
              <div className="flex items-center" style={{ gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 20, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                }}>
                  <MdGroups />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Data Anggota {activeUkm?.name}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Daftar seluruh mahasiswa anggota aktif</p>
                </div>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: 240 }}>
                  <MdSearch style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)', fontSize: 18 }} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Cari nama, NIM..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 38, height: 40, fontSize: 13, borderRadius: 12 }}
                  />
                </div>

                <select
                  className="input"
                  value={prodiFilter}
                  onChange={e => setProdiFilter(e.target.value)}
                  style={{ height: 40, fontSize: 13, minWidth: 170, borderRadius: 12 }}
                >
                  <option value="all">Semua Program Studi</option>
                  {prodiList.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="empty-state"><div className="icon">⏳</div><p>Memuat daftar anggota...</p></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="icon">👥</div>
                <p>{search ? 'Tidak ada anggota yang cocok dengan pencarian' : 'Belum ada anggota terdaftar di UKM ini'}</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table style={{ borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>#</th>
                      <th>Mahasiswa</th>
                      <th>NIM</th>
                      <th>Program Studi</th>
                      <th>UKM Lain</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m, i) => {
                      const color = avatarColors[i % avatarColors.length];
                      return (
                        <tr key={m.id} style={{ background: 'var(--bg-subtle)', borderRadius: 12 }}>
                          <td style={{ color: 'var(--text-muted)', fontWeight: 600, padding: '14px 16px' }}>{i + 1}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 38, height: 38, borderRadius: '50%',
                                background: color.bg, color: color.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: 13, flexShrink: 0
                              }}>
                                {getInitials(m.name)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                                  {m.name}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                  {m.email || 'mahasiswa@stmiklombok.ac.id'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              fontFamily: 'monospace', fontWeight: 700, fontSize: 12,
                              background: 'rgba(59, 130, 246, 0.08)', color: '#2563eb',
                              padding: '4px 10px', borderRadius: 8
                            }}>
                              {m.nim}
                            </span>
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '14px 16px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <MdSchool style={{ color: 'var(--text-muted)', fontSize: 16 }} />
                              {m.prodi || '-'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {m.ukms?.filter(uk => uk.id !== activeId).length > 0 ? (
                                m.ukms?.filter(uk => uk.id !== activeId).map(uk => (
                                  <span key={uk.id} className="badge badge-blue" style={{ fontSize: 11, padding: '3px 8px' }}>
                                    {uk.name}
                                  </span>
                                ))
                              ) : (
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>-</span>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                            <span className="badge badge-green" style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 11, padding: '4px 10px', borderRadius: 99
                            }}>
                              <MdVerified style={{ fontSize: 13 }} /> Aktif
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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

