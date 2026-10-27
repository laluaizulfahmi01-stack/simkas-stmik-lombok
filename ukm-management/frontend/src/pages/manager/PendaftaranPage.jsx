// src/pages/manager/PendaftaranPage.jsx
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import ProPageHeader from '../../components/ProPageHeader';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import {
  MdEventAvailable, MdHowToReg, MdSearch, MdCheckCircle,
  MdCancel, MdHourglassTop, MdClose, MdOutlineEditCalendar,
  MdSave, MdPersonOutline
} from 'react-icons/md';

export default function ManagerPendaftaranPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [ukms, setUkms] = useState([]);
  const [activeUkmId, setActiveUkmId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Schedule Settings Form
  const [scheduleForm, setScheduleForm] = useState({
    registrationOpen: false,
    registrationOpenDate: '',
    registrationCloseDate: '',
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Status Action Modal (Reject / Note Modal)
  const [actionModal, setActionModal] = useState({
    open: false,
    appId: null,
    targetStatus: '',
    applicantName: '',
    note: '',
  });

  // Load Manager UKMs
  useEffect(() => {
    api.get('/ukm').then(r => {
      const mine = r.data.filter(u => Number(u.managerId) === Number(user?.id));
      const list = mine.length ? mine : r.data;
      setUkms(list);
      if (list.length) {
        setActiveUkmId(list[0].id);
        setScheduleForm({
          registrationOpen: Boolean(list[0].registrationOpen),
          registrationOpenDate: list[0].registrationOpenDate || '',
          registrationCloseDate: list[0].registrationCloseDate || '',
        });
      }
    }).catch(() => {});
  }, [user]);

  // Load Applications for Active UKM
  const loadApps = async () => {
    if (!activeUkmId) return;
    setLoading(true);
    try {
      const res = await api.get(`/applications/ukm/${activeUkmId}`);
      setApplications(res.data);
    } catch {
      toast('Gagal memuat daftar pendaftar', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
    const curr = ukms.find(u => u.id === activeUkmId);
    if (curr) {
      setScheduleForm({
        registrationOpen: Boolean(curr.registrationOpen),
        registrationOpenDate: curr.registrationOpenDate || '',
        registrationCloseDate: curr.registrationCloseDate || '',
      });
    }
  }, [activeUkmId]);

  // Filter & Search logic
  useEffect(() => {
    let list = [...applications];
    if (statusFilter !== 'all') {
      list = list.filter(a => a.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.applicant?.name?.toLowerCase().includes(q) ||
        a.applicant?.nim?.toLowerCase().includes(q) ||
        a.motivation?.toLowerCase().includes(q)
      );
    }
    setFilteredApps(list);
  }, [applications, statusFilter, search]);

  const activeUkm = ukms.find(u => u.id === activeUkmId);

  // Save Schedule Settings (FR-PND-01)
  const handleSaveSchedule = async e => {
    e.preventDefault();
    if (!activeUkmId) return;
    setSavingSchedule(true);
    try {
      await api.put(`/ukm/${activeUkmId}`, scheduleForm);
      toast('Jadwal pendaftaran UKM berhasil diperbarui!', 'success');
      // Update local state
      setUkms(ukms.map(u => u.id === activeUkmId ? { ...u, ...scheduleForm } : u));
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal menyimpan jadwal pendaftaran', 'error');
    } finally {
      setSavingSchedule(false);
    }
  };

  // Change Application Status (FR-PND-04 & FR-PND-07)
  const handleQuickStatus = async (appId, status, applicantName) => {
    if (status === 'ditolak') {
      setActionModal({
        open: true,
        appId,
        targetStatus: 'ditolak',
        applicantName,
        note: '',
      });
      return;
    }

    try {
      const res = await api.put(`/applications/${appId}/status`, { status });
      toast(res.data.message || 'Status pendaftaran berhasil diperbarui!', 'success');
      loadApps();
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal memperbarui status', 'error');
    }
  };

  const submitActionModal = async e => {
    e.preventDefault();
    try {
      const res = await api.put(`/applications/${actionModal.appId}/status`, {
        status: actionModal.targetStatus,
        note: actionModal.note,
      });
      toast(res.data.message || 'Status pendaftaran berhasil diperbarui!', 'success');
      setActionModal({ open: false, appId: null, targetStatus: '', applicantName: '', note: '' });
      loadApps();
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal memperbarui status', 'error');
    }
  };

  // Counts
  const countAll = applications.length;
  const countDiajukan = applications.filter(a => a.status === 'diajukan').length;
  const countSeleksi = applications.filter(a => a.status === 'dalam_seleksi').length;
  const countDiterima = applications.filter(a => a.status === 'diterima').length;
  const countDitolak = applications.filter(a => a.status === 'ditolak').length;

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ProPageHeader
          title="Seleksi & Pendaftaran UKM"
          subtitle={`Kelola gelombang Open Recruitment dan seleksi calon anggota ${activeUkm?.name || ''}`}
          pillBadge={`${countAll} Pendaftar`}
          pillColor="indigo"
          actions={
            ukms.length > 1 && (
              <select
                className="input"
                style={{ borderRadius: 999, padding: '6px 14px', fontSize: 13 }}
                value={activeUkmId || ''}
                onChange={e => setActiveUkmId(Number(e.target.value))}
              >
                {ukms.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )
          }
        />

        <div className="main-content">
          {/* Top Panel: Pengaturan Jadwal Pendaftaran UKM (FR-PND-01) */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MdOutlineEditCalendar style={{ color: 'var(--primary)', fontSize: 20 }} />
                  Pengaturan Gelombang Pendaftaran ({activeUkm?.name})
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Atur apakah pendaftaran dibuka untuk mahasiswa dan tentukan batas tanggalnya (PRD FR-PND-01)
                </p>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: scheduleForm.registrationOpen ? '#dcfce7' : '#f3f4f6',
                  color: scheduleForm.registrationOpen ? '#15803d' : '#6b7280',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: scheduleForm.registrationOpen ? '#22c55e' : '#9ca3af',
                  }}
                />
                {scheduleForm.registrationOpen ? 'Status: Dibuka untuk Mahasiswa' : 'Status: Ditutup'}
              </div>
            </div>

            <form onSubmit={handleSaveSchedule} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Status Open Recruitment</label>
                <select
                  className="input"
                  value={scheduleForm.registrationOpen ? 'true' : 'false'}
                  onChange={e => setScheduleForm({ ...scheduleForm, registrationOpen: e.target.value === 'true' })}
                >
                  <option value="true">🟢 Buka Pendaftaran (Aktif)</option>
                  <option value="false">⚪ Tutup Pendaftaran (Nonaktif)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Tanggal Buka Pendaftaran</label>
                <input
                  type="date"
                  className="input"
                  value={scheduleForm.registrationOpenDate}
                  onChange={e => setScheduleForm({ ...scheduleForm, registrationOpenDate: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Tanggal Tutup Pendaftaran</label>
                <input
                  type="date"
                  className="input"
                  value={scheduleForm.registrationCloseDate}
                  onChange={e => setScheduleForm({ ...scheduleForm, registrationCloseDate: e.target.value })}
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={savingSchedule}
                  style={{ justifyContent: 'center', height: 40 }}
                >
                  <MdSave style={{ marginRight: 6 }} />
                  {savingSchedule ? 'Menyimpan...' : 'Simpan Pengaturan Jadwal'}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Stat Cards */}
          <div className="grid-4" style={{ marginBottom: 20 }}>
            <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                <MdHowToReg />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL PENDAFTAR</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{countAll}</div>
              </div>
            </div>

            <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                <MdHourglassTop />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>PERLU DITINJAU</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706' }}>{countDiajukan}</div>
              </div>
            </div>

            <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                <MdEventAvailable />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>DALAM SELEKSI</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#7c3aed' }}>{countSeleksi}</div>
              </div>
            </div>

            <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                <MdCheckCircle />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>DITERIMA RESMI</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>{countDiterima}</div>
              </div>
            </div>
          </div>

          {/* Table of Applicants */}
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: `Semua (${countAll})` },
                  { id: 'diajukan', label: `Diajukan (${countDiajukan})` },
                  { id: 'dalam_seleksi', label: `Dalam Seleksi (${countSeleksi})` },
                  { id: 'diterima', label: `Diterima (${countDiterima})` },
                  { id: 'ditolak', label: `Ditolak (${countDitolak})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: statusFilter === tab.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: statusFilter === tab.id ? 'var(--primary)' : 'var(--bg-card)',
                      color: statusFilter === tab.id ? '#fff' : 'var(--text-secondary)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
                <MdSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                <input
                  className="input"
                  placeholder="Cari nama / NIM..."
                  style={{ paddingLeft: 36, fontSize: 13 }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <p>Memuat daftar pendaftar...</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📂</div>
                <h4 style={{ fontWeight: 700 }}>Tidak Ada Pendaftar</h4>
                <p style={{ maxWidth: 400, margin: '6px auto' }}>
                  Belum ada calon anggota baru yang mendaftar pada kriteria seleksi ini.
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Calon Anggota</th>
                      <th>NIM</th>
                      <th>Program Studi</th>
                      <th>Tanggal Daftar</th>
                      <th>Motivasi Pendaftar</th>
                      <th>Status</th>
                      <th>Catatan</th>
                      <th>Aksi Seleksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((app, index) => {
                      const statusBadge =
                        app.status === 'diterima'
                          ? 'badge-green'
                          : app.status === 'dalam_seleksi'
                          ? 'badge-purple'
                          : app.status === 'diajukan'
                          ? 'badge-yellow'
                          : app.status === 'ditolak'
                          ? 'badge-red'
                          : 'badge-gray';

                      return (
                        <tr key={app.id}>
                          <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                          <td>
                            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <MdPersonOutline style={{ fontSize: 18, color: 'var(--text-muted)' }} />
                              {app.applicant?.name || 'Mahasiswa'}
                              {app.applicant?.isVerified && (
                                <span style={{ color: '#10b981', fontSize: 11 }} title="KTM Terverifikasi">✓</span>
                              )}
                            </div>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{app.applicant?.nim}</td>
                          <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{app.applicant?.prodi}</td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {new Date(app.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td style={{ maxWidth: 220, fontSize: 13, color: 'var(--text-primary)' }}>
                            {app.motivation || '-'}
                          </td>
                          <td>
                            <span className={`badge ${statusBadge}`} style={{ fontSize: 11 }}>
                              {app.status === 'diterima'
                                ? 'Diterima (Anggota)'
                                : app.status === 'dalam_seleksi'
                                ? 'Dalam Seleksi'
                                : app.status === 'diajukan'
                                ? 'Diajukan'
                                : app.status === 'ditolak'
                                ? 'Ditolak'
                                : 'Dibatalkan'}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {app.managerNote || app.cancelReason || '-'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {app.status === 'diajukan' && (
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => handleQuickStatus(app.id, 'dalam_seleksi', app.applicant?.name)}
                                  title="Ubah status ke Dalam Seleksi"
                                  style={{ color: '#7c3aed' }}
                                >
                                  Mulai Seleksi
                                </button>
                              )}

                              {['diajukan', 'dalam_seleksi'].includes(app.status) && (
                                <>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleQuickStatus(app.id, 'diterima', app.applicant?.name)}
                                    title="Terima menjadi Anggota Resmi UKM (FR-PND-07)"
                                    style={{ background: '#16a34a', borderColor: '#16a34a' }}
                                  >
                                    <MdCheckCircle style={{ marginRight: 4 }} /> Terima
                                  </button>

                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleQuickStatus(app.id, 'ditolak', app.applicant?.name)}
                                    title="Tolak pendaftaran"
                                  >
                                    <MdCancel style={{ marginRight: 4 }} /> Tolak
                                  </button>
                                </>
                              )}

                              {app.status === 'diterima' && (
                                <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>
                                  ✓ Resmi Anggota
                                </span>
                              )}
                            </div>
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

      {/* REJECT MODAL WITH REASON */}
      {actionModal.open && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActionModal({ ...actionModal, open: false })}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3>Tolak Pendaftaran Calon Anggota</h3>
              <button className="modal-close" onClick={() => setActionModal({ ...actionModal, open: false })}>
                <MdClose />
              </button>
            </div>

            <form onSubmit={submitActionModal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Anda akan menolak pengajuan pendaftaran dari <strong>{actionModal.applicantName}</strong>. Kuota pendaftaran mahasiswa akan dikembalikan.
              </p>

              <div className="form-group">
                <label>Alasan / Catatan Penolakan (Opsional)</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Contoh: Kuota divisi telah penuh, atau belum memenuhi kualifikasi seleksi wawancara..."
                  value={actionModal.note}
                  onChange={e => setActionModal({ ...actionModal, note: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setActionModal({ ...actionModal, open: false })}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-danger">
                  Konfirmasi Tolak Pendaftaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
