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
  MdSave, MdPersonOutline, MdAdd, MdDeleteOutline, MdRefresh,
  MdTableChart
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

  const parseSchedule = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Schedule & Matriculation Settings Form
  const [scheduleForm, setScheduleForm] = useState({
    registrationOpen: false,
    registrationOpenDate: '',
    registrationCloseDate: '',
    matriculationDate: '',
    matriculationTime: '09:00 - 12:30 WITA',
    matriculationLocation: 'Lab Komputer 1 & 2 STMIK Lombok',
    matriculationNotes: 'Membawa KTM fisik, berpakaian rapi dan mengenakan jas almamater kampus.',
    matriculationSchedule: [],
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
        const sched = parseSchedule(list[0].matriculationSchedule);
        setScheduleForm({
          registrationOpen: Boolean(list[0].registrationOpen),
          registrationOpenDate: list[0].registrationOpenDate || '',
          registrationCloseDate: list[0].registrationCloseDate || '',
          matriculationDate: list[0].matriculationDate || '',
          matriculationTime: list[0].matriculationTime || '09:00 - 12:30 WITA',
          matriculationLocation: list[0].matriculationLocation || 'Lab Komputer 1 & 2 STMIK Lombok',
          matriculationNotes: list[0].matriculationNotes || '',
          matriculationSchedule: sched,
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
      const sched = parseSchedule(curr.matriculationSchedule);
      setScheduleForm({
        registrationOpen: Boolean(curr.registrationOpen),
        registrationOpenDate: curr.registrationOpenDate || '',
        registrationCloseDate: curr.registrationCloseDate || '',
        matriculationDate: curr.matriculationDate || '',
        matriculationTime: curr.matriculationTime || '09:00 - 12:30 WITA',
        matriculationLocation: curr.matriculationLocation || 'Lab Komputer 1 & 2 STMIK Lombok',
        matriculationNotes: curr.matriculationNotes || '',
        matriculationSchedule: sched,
      });
    }
  }, [activeUkmId]);

  // Schedule Table Handlers
  const handleAddScheduleRow = () => {
    const rows = scheduleForm.matriculationSchedule || [];
    const nextDayNum = rows.length + 1;
    const newRow = {
      day: `Hari ke-${nextDayNum}`,
      date: '',
      time: '09:00 - 12:00 WITA',
      agenda: '',
      location: 'Lab Komputer STMIK Lombok',
      instructor: '',
    };
    setScheduleForm(prev => ({
      ...prev,
      matriculationSchedule: [...rows, newRow],
    }));
  };

  const handleUpdateScheduleRow = (index, field, value) => {
    setScheduleForm(prev => {
      const rows = [...(prev.matriculationSchedule || [])];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, matriculationSchedule: rows };
    });
  };

  const handleDeleteScheduleRow = (index) => {
    setScheduleForm(prev => {
      const rows = (prev.matriculationSchedule || []).filter((_, idx) => idx !== index);
      const renumbered = rows.map((r, i) => ({ ...r, day: `Hari ke-${i + 1}` }));
      return { ...prev, matriculationSchedule: renumbered };
    });
  };

  const handleLoadDefaultWeekSchedule = () => {
    const default7Days = [
      { day: 'Hari ke-1', date: '2026-11-02', time: '09:00 - 12:00 WITA', agenda: 'Orientasi Organisasi, Pengenalan Visi Misi & Tata Tertib UKM', location: 'Lab Komputer 1 STMIK', instructor: 'Pembina & Pengurus UKM' },
      { day: 'Hari ke-2', date: '2026-11-03', time: '09:00 - 12:00 WITA', agenda: 'Fundamental Keilmuan Organisasi & Pengenalan Tools Divisi', location: 'Lab Komputer 2 STMIK', instructor: 'Divisi Teknis' },
      { day: 'Hari ke-3', date: '2026-11-04', time: '13:30 - 16:30 WITA', agenda: 'Praktik Langsung & Pendalaman Materi Studi Kasus', location: 'Lab Komputer 1 STMIK', instructor: 'Mentor Senior' },
      { day: 'Hari ke-4', date: '2026-11-05', time: '09:00 - 12:00 WITA', agenda: 'Workshop Kolaborasi Kelompok & Pemecahan Masalah', location: 'Lab Komputer 1 & 2', instructor: 'Tim Fasilitator' },
      { day: 'Hari ke-5', date: '2026-11-06', time: '14:00 - 17:00 WITA', agenda: 'Etika Berorganisasi, Manajemen Kepemimpinan & Waktu', location: 'Auditorium Lt. 3 STMIK', instructor: 'Narasumber Kampus' },
      { day: 'Hari ke-6', date: '2026-11-07', time: '09:00 - 13:00 WITA', agenda: 'Uji Kemampuan Kelompok, Presentasi Karya & Evaluasi Sesi', location: 'Lab Komputer 1 STMIK', instructor: 'Dewan Penguji' },
      { day: 'Hari ke-7', date: '2026-11-08', time: '10:00 - 13:00 WITA', agenda: 'Evaluasi Kelulusan, Pengumuman & Pelantikan Anggota Resmi', location: 'Aula Utama Kampus', instructor: 'Ketua UKM & BPH' },
    ];
    setScheduleForm(prev => ({
      ...prev,
      matriculationSchedule: default7Days,
    }));
    toast('Template jadwal matrikulasi 1 minggu berhasil dimuat! Silakan sesuaikan dan klik Simpan.', 'info');
  };

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
    if (e && e.preventDefault) e.preventDefault();
    if (!activeUkmId) {
      return toast('Pilih UKM terlebih dahulu', 'error');
    }
    setSavingSchedule(true);
    try {
      const payload = {
        registrationOpen: Boolean(scheduleForm.registrationOpen),
        registrationOpenDate: scheduleForm.registrationOpenDate || null,
        registrationCloseDate: scheduleForm.registrationCloseDate || null,
        matriculationDate: scheduleForm.matriculationDate || null,
        matriculationTime: scheduleForm.matriculationTime || null,
        matriculationLocation: scheduleForm.matriculationLocation || null,
        matriculationNotes: scheduleForm.matriculationNotes || null,
        matriculationSchedule: JSON.stringify(scheduleForm.matriculationSchedule || []),
      };
      const res = await api.put(`/ukm/${activeUkmId}`, payload);
      toast('Pengaturan gelombang pendaftaran & tabel matrikulasi berhasil disimpan!', 'success');
      // Update local state
      setUkms(prev => prev.map(u => u.id === activeUkmId ? { ...u, ...res.data } : u));
    } catch (err) {
      console.error('Save schedule error:', err);
      toast(err.response?.data?.message || 'Gagal menyimpan pengaturan jadwal', 'error');
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
                  Pengaturan Gelombang Pendaftaran Tahunan ({activeUkm?.name})
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Pendaftaran UKM dibuka <strong>1 kali dalam 1 tahun</strong> pada setiap Tahun Ajaran Baru. Tentukan jadwal dan status pembukaan pendaftaran bagi mahasiswa baru/calon anggota.
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

            <form onSubmit={handleSaveSchedule} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Baris 1: Pengaturan Gelombang Open Recruitment */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                    Status Open Recruitment
                  </label>
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
                  <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                    Tanggal Buka Pendaftaran
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={scheduleForm.registrationOpenDate}
                    onChange={e => setScheduleForm({ ...scheduleForm, registrationOpenDate: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                    Tanggal Tutup Pendaftaran
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={scheduleForm.registrationCloseDate}
                    onChange={e => setScheduleForm({ ...scheduleForm, registrationCloseDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Baris 2: Catatan & Persyaratan Umum */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                  Ketentuan Umum & Syarat Kelulusan Matrikulasi ({activeUkm?.name})
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Contoh: Membawa KTM fisik, bersepatu, berpakaian rapi dengan jas almamater kampus STMIK Lombok"
                  value={scheduleForm.matriculationNotes}
                  onChange={e => setScheduleForm({ ...scheduleForm, matriculationNotes: e.target.value })}
                />
              </div>

              {/* Baris 3: TABEL RUNDOWN JADWAL MATRIKULASI (Bisa Seminggu Penuh / Multi-Hari) */}
              <div
                style={{
                  background: 'var(--bg-card, #ffffff)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 16,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontWeight: 800, fontSize: 15 }}>
                      <MdTableChart style={{ fontSize: 20, color: 'var(--primary)' }} />
                      <span>Tabel Jadwal & Agenda Matrikulasi ({activeUkm?.name})</span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                      Susun jadwal matrikulasi hari demi hari secara rapi (bisa 1 hari, 3 hari, hingga 1 minggu penuh). Calon mahasiswa akan melihat tabel ini di akun mereka.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleLoadDefaultWeekSchedule}
                      style={{ borderRadius: 999, fontSize: 12, fontWeight: 700 }}
                      title="Isi otomatis dengan contoh susunan 7 hari (1 minggu)"
                    >
                      <MdRefresh style={{ marginRight: 4 }} /> Muat Template 1 Minggu
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleAddScheduleRow}
                      style={{ borderRadius: 999, fontSize: 12, fontWeight: 700 }}
                    >
                      <MdAdd style={{ marginRight: 4 }} /> Tambah Hari / Sesi
                    </button>
                  </div>
                </div>

                {/* Table Editor */}
                {(!scheduleForm.matriculationSchedule || scheduleForm.matriculationSchedule.length === 0) ? (
                  <div
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 14,
                      padding: '36px 16px',
                      textAlign: 'center',
                      background: 'var(--bg-subtle, #f8fafc)',
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
                    <h4 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
                      Belum Ada Tabel Jadwal Matrikulasi
                    </h4>
                    <p style={{ margin: '0 auto 16px', fontSize: 13, color: 'var(--text-secondary)', maxWidth: 460 }}>
                      Klik tombol di bawah untuk menambahkan sesi pertama atau gunakan template standar 1 minggu penuh.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleLoadDefaultWeekSchedule}
                        style={{ borderRadius: 999 }}
                      >
                        <MdRefresh style={{ marginRight: 6 }} /> Gunakan Contoh 7 Hari Matrikulasi
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={handleAddScheduleRow}
                        style={{ borderRadius: 999 }}
                      >
                        <MdAdd style={{ marginRight: 4 }} /> Tambah Manual
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="table-wrap" style={{ borderRadius: 12, border: '1px solid var(--border)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: 860, borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-subtle, #f8fafc)', borderBottom: '1.5px solid var(--border)' }}>
                          <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, width: 110 }}>Hari</th>
                          <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, width: 150 }}>Tanggal</th>
                          <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, width: 160 }}>Waktu / Jam</th>
                          <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800 }}>Materi / Agenda Sesi</th>
                          <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, width: 180 }}>Lokasi / Lab</th>
                          <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, width: 160 }}>Pemateri / PJ</th>
                          <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, width: 60, textAlign: 'center' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduleForm.matriculationSchedule.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px 10px' }}>
                              <input
                                className="input"
                                style={{ padding: '6px 8px', fontSize: 12, fontWeight: 800, textAlign: 'center', background: 'var(--bg-subtle)' }}
                                value={row.day || `Hari ke-${idx + 1}`}
                                onChange={e => handleUpdateScheduleRow(idx, 'day', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <input
                                type="date"
                                className="input"
                                style={{ padding: '6px 8px', fontSize: 12 }}
                                value={row.date || ''}
                                onChange={e => handleUpdateScheduleRow(idx, 'date', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <input
                                className="input"
                                style={{ padding: '6px 8px', fontSize: 12 }}
                                placeholder="09:00 - 12:00 WITA"
                                value={row.time || ''}
                                onChange={e => handleUpdateScheduleRow(idx, 'time', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <input
                                className="input"
                                style={{ padding: '6px 8px', fontSize: 12, fontWeight: 600 }}
                                placeholder="Materi / agenda kegiatan..."
                                value={row.agenda || ''}
                                onChange={e => handleUpdateScheduleRow(idx, 'agenda', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <input
                                className="input"
                                style={{ padding: '6px 8px', fontSize: 12 }}
                                placeholder="Lab Komputer 1..."
                                value={row.location || ''}
                                onChange={e => handleUpdateScheduleRow(idx, 'location', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <input
                                className="input"
                                style={{ padding: '6px 8px', fontSize: 12 }}
                                placeholder="Pemateri / PJ..."
                                value={row.instructor || ''}
                                onChange={e => handleUpdateScheduleRow(idx, 'instructor', e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteScheduleRow(idx)}
                                title="Hapus Sesi Ini"
                                style={{
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#dc2626',
                                  border: 'none',
                                  width: 30,
                                  height: 30,
                                  borderRadius: 8,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  fontSize: 16,
                                }}
                              >
                                <MdDeleteOutline />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Submit Button & Total Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 4 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Total Terjadwal: <strong>{scheduleForm.matriculationSchedule?.length || 0} Hari Matrikulasi</strong>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingSchedule}
                  style={{ minWidth: 280, justifyContent: 'center', height: 44, fontWeight: 800, fontSize: 13 }}
                >
                  <MdSave style={{ marginRight: 6, fontSize: 18 }} />
                  {savingSchedule ? 'Menyimpan...' : 'Simpan Pengaturan Jadwal & Tabel Matrikulasi'}
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
