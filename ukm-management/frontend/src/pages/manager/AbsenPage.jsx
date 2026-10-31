// src/pages/manager/AbsenPage.jsx - Kelola Pertemuan, Roster Presensi & Review Izin
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import ProPageHeader from '../../components/ProPageHeader';
import api from '../../api/axios';
import { useToast } from '../../components/Toast';
import {
  MdAdd, MdCheckCircle, MdCancel, MdEventAvailable, MdClose,
  MdSave, MdSchedule, MdPlace, MdCalendarToday, MdMail,
  MdDoneAll, MdFactCheck, MdHistoryEdu, MdPerson, MdQrCode,
  MdContentCopy, MdVisibility, MdPrint, MdSearch, MdNorthEast,
  MdCheck, MdLocalHospital, MdArrowBack, MdFilterList, MdOutlineChecklist
} from 'react-icons/md';

export default function ManagerAbsenPage() {
  const { user } = useAuth();
  const [ukms, setUkms] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState('meetings'); // 'meetings' | 'roster' | 'leave'

  const [meetings, setMeetings] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [rosterData, setRosterData] = useState([]);
  const [meetingDetail, setMeetingDetail] = useState(null);
  const [checklistSearch, setChecklistSearch] = useState('');
  const [checklistFilter, setChecklistFilter] = useState('all');

  // Modals
  const [meetingModal, setMeetingModal] = useState(false);
  const [qrModalItem, setQrModalItem] = useState(null);
  const [proofModalUrl, setProofModalUrl] = useState(null);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    meetingNumber: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00 - 16:30 WITA',
    location: 'Lab Komputer STMIK Lombok',
    agenda: '',
  });

  const [savingRoster, setSavingRoster] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get('/ukm').then(r => {
      const mine = r.data.filter(u => Number(u.managerId) === Number(user?.id));
      const list = (mine.length || user?.role === 'manager') ? (mine.length ? mine : r.data) : r.data;
      setUkms(list);
      if (list.length) setActiveId(list[0].id);
    });
  }, [user]);

  const loadData = () => {
    if (!activeId) return;
    setLoading(true);
    Promise.all([
      api.get(`/attendance/${activeId}/meetings`),
      api.get(`/attendance/${activeId}/leave-requests`),
    ])
      .then(([mRes, lRes]) => {
        setMeetings(mRes.data || []);
        setLeaveRequests(lRes.data || []);
        if (mRes.data?.length && !selectedMeetingId) {
          setSelectedMeetingId(mRes.data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadData, [activeId]);

  // Load roster when selectedMeetingId changes
  const loadRoster = (mId) => {
    if (!activeId || !mId) return;
    api.get(`/attendance/${activeId}/meetings/${mId}/roster`)
      .then(res => {
        setMeetingDetail(res.data.meeting);
        setRosterData(res.data.roster || []);
      })
      .catch(() => toast('Gagal memuat daftar hadir pertemuan', 'error'));
  };

  useEffect(() => {
    if (selectedMeetingId) {
      loadRoster(selectedMeetingId);
    }
  }, [selectedMeetingId, activeId]);

  // Create new meeting
  const handleCreateMeeting = async e => {
    e.preventDefault();
    try {
      await api.post(`/attendance/${activeId}/meetings`, newMeeting);
      toast('Sesi pertemuan berhasil dibuat! 📅', 'success');
      setMeetingModal(false);
      setNewMeeting({
        title: '',
        meetingNumber: '',
        date: new Date().toISOString().split('T')[0],
        time: '14:00 - 16:30 WITA',
        location: 'Lab Komputer STMIK Lombok',
        agenda: '',
      });
      loadData();
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal membuat sesi pertemuan', 'error');
    }
  };

  // Change individual student status in roster
  const setStudentStatus = (userId, status) => {
    setRosterData(prev =>
      prev.map(item => (item.userId === userId ? { ...item, status } : item))
    );
  };

  // Toggle Hadir / Alpa with 1-click
  const toggleHadir = (userId) => {
    setRosterData(prev =>
      prev.map(item => {
        if (item.userId !== userId) return item;
        return {
          ...item,
          status: item.status === 'hadir' ? 'alpa' : 'hadir',
        };
      })
    );
  };

  // Change all student status at once
  const setAllStatus = status => {
    setRosterData(prev => prev.map(item => ({ ...item, status })));
  };

  // Save Roster Attendance
  const handleSaveRoster = async () => {
    setSavingRoster(true);
    try {
      await api.post(`/attendance/${activeId}/meetings/${selectedMeetingId}/roster`, {
        roster: rosterData.map(r => ({
          userId: r.userId,
          status: r.status,
          keterangan: r.keterangan || null,
        })),
      });
      toast('Presensi pertemuan berhasil disimpan! ✅', 'success');
      loadData();
    } catch {
      toast('Gagal menyimpan presensi', 'error');
    } finally {
      setSavingRoster(false);
    }
  };

  // Review Leave Request
  const handleReviewLeave = async (leaveId, status) => {
    const note = prompt(`Masukkan catatan review untuk mahasiswa (opsional):`, status === 'approved' ? 'Disetujui oleh pengurus' : 'Alasan kurang lengkap');
    if (note === null) return;

    try {
      await api.put(`/attendance/${activeId}/leave-requests/${leaveId}/review`, {
        status,
        reviewNotes: note,
      });
      toast(`Izin berhasil di-${status === 'approved' ? 'setujui' : 'tolak'}!`, 'success');
      loadData();
      if (selectedMeetingId) loadRoster(selectedMeetingId);
    } catch {
      toast('Gagal memproses perizinan', 'error');
    }
  };

  const activeUkm = ukms.find(u => u.id === activeId);
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');

  const copyToken = (text) => {
    navigator.clipboard.writeText(text);
    toast('Kode token presensi berhasil disalin! 📋', 'success');
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ProPageHeader
          title="Pusat Presensi & Absensi"
          subtitle={`Kelola sesi pertemuan, token QR check-in & verifikasi perizinan ${activeUkm?.name || 'UKM STMIK Lombok'}`}
          pillBadge="Presensi Terverifikasi"
          pillColor="indigo"
          actions={
            <button
              className="btn btn-primary"
              onClick={() => setMeetingModal(true)}
              style={{ borderRadius: 12, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
            >
              <MdAdd style={{ fontSize: 20 }} /> Buat Sesi Baru
            </button>
          }
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
          {/* Main Navigation Tabs */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <button
              className={`btn ${tab === 'meetings' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('meetings')}
              style={{ borderRadius: 12, padding: '9px 20px', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              <MdCalendarToday /> Daftar Sesi Pertemuan ({meetings.length})
            </button>

            <button
              className={`btn ${tab === 'roster' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('roster')}
              style={{ borderRadius: 12, padding: '9px 20px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0, whiteSpace: 'nowrap', background: tab === 'roster' ? '#16a34a' : 'transparent', borderColor: tab === 'roster' ? '#16a34a' : 'transparent', color: tab === 'roster' ? '#fff' : 'inherit' }}
            >
              <MdFactCheck style={{ fontSize: 17 }} /> ✓ Lembar Ceklis Presensi
            </button>

            <button
              className={`btn ${tab === 'leave' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('leave')}
              style={{ borderRadius: 12, padding: '9px 20px', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, position: 'relative', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              <MdMail /> Kotak Izin Masuk ({leaveRequests.length})
              {pendingLeaves.length > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: 99,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {pendingLeaves.length} Baru
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: DAFTAR PERTEMUAN */}
          {tab === 'meetings' && (
            <div className="card">
              <div className="flex justify-between items-center" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                    Daftar Sesi Pertemuan {activeUkm?.name}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                    Lakukan presensi kehadiran anggota UKM per pertemuan secara langsung dengan sistem ceklis pengelola.
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setMeetingModal(true)} style={{ borderRadius: 10, padding: '8px 16px', fontWeight: 600 }}>
                  <MdAdd /> Tambah Sesi
                </button>
              </div>

              {meetings.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📅</div>
                  <p>Belum ada sesi pertemuan. Klik tombol di atas untuk membuat pertemuan pertama!</p>
                </div>
              ) : (
                <>
                  {/* 1. Desktop Table View */}
                  <div className="table-wrap desktop-table-only">
                    <table>
                      <thead>
                        <tr>
                          <th>Sesi</th>
                          <th>Agenda & Topik Pertemuan</th>
                          <th>Jadwal & Tempat</th>
                          <th>Status Ceklis Kehadiran</th>
                          <th>Aksi Presensi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meetings.map(m => {
                          const mHadir = m.attendances?.filter(a => a.status === 'hadir').length || 0;
                          const mIzin = m.attendances?.filter(a => a.status === 'izin').length || 0;
                          const mSakit = m.attendances?.filter(a => a.status === 'sakit').length || 0;
                          const mAlpa = m.attendances?.filter(a => a.status === 'alpa' || a.status === 'alpha').length || 0;
                          const mTotal = (m.attendances || []).length;
                          const isDone = mTotal > 0;

                          return (
                            <tr key={m.id}>
                              <td>
                                <span style={{ fontWeight: 800, color: 'var(--primary)', background: '#eff6ff', padding: '4px 10px', borderRadius: 8 }}>
                                  #{m.meetingNumber}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{m.title}</div>
                                {m.agenda && (
                                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                    {m.agenda}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>
                                  <MdCalendarToday style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                  {m.date}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                  <MdSchedule style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                  {m.time} &bull; {m.location}
                                </div>
                              </td>
                              <td>
                                <div>
                                  <span
                                    className={`badge ${isDone ? 'badge-green' : 'badge-yellow'}`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 4, fontWeight: 700 }}
                                  >
                                    {isDone ? <MdCheckCircle /> : <MdSchedule />}
                                    {isDone ? 'Sudah Diceklis' : 'Belum Diceklis'}
                                  </span>
                                  {isDone && (
                                    <div style={{ display: 'flex', gap: 6, fontSize: 11, flexWrap: 'wrap' }}>
                                      <span style={{ color: '#16a34a', fontWeight: 700 }}>{mHadir} Hadir</span>
                                      {mIzin > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}>{mIzin} Izin</span>}
                                      {mSakit > 0 && <span style={{ color: '#0284c7', fontWeight: 600 }}>{mSakit} Sakit</span>}
                                      {mAlpa > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}>{mAlpa} Alpa</span>}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                      setSelectedMeetingId(m.id);
                                      setTab('roster');
                                    }}
                                    style={{
                                      background: '#16a34a',
                                      borderColor: '#16a34a',
                                      color: '#ffffff',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      fontWeight: 700,
                                      padding: '7px 14px',
                                      borderRadius: 10,
                                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                                    }}
                                  >
                                    <MdFactCheck style={{ fontSize: 16 }} /> Ceklis Presensi
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setQrModalItem(m)}
                                    title="Opsi QR & Token Cadangan"
                                    style={{ padding: '6px 8px', borderRadius: 8 }}
                                  >
                                    <MdQrCode style={{ fontSize: 16 }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 2. Mobile Clean Cards View */}
                  <div className="mobile-cards-only">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {meetings.map(m => {
                        const mHadir = m.attendances?.filter(a => a.status === 'hadir').length || 0;
                        const mIzin = m.attendances?.filter(a => a.status === 'izin').length || 0;
                        const mSakit = m.attendances?.filter(a => a.status === 'sakit').length || 0;
                        const mAlpa = m.attendances?.filter(a => a.status === 'alpa' || a.status === 'alpha').length || 0;
                        const isDone = (m.attendances || []).length > 0;

                        return (
                          <div key={m.id} className="mobile-tx-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                              <span style={{ fontWeight: 800, color: 'var(--primary)', background: '#eff6ff', padding: '3px 8px', borderRadius: 8, fontSize: 12 }}>
                                Sesi #{m.meetingNumber}
                              </span>
                              <span
                                className={`badge ${isDone ? 'badge-green' : 'badge-yellow'}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '3px 8px' }}
                              >
                                {isDone ? <MdCheckCircle /> : <MdSchedule />}
                                {isDone ? 'Sudah Diceklis' : 'Belum Diceklis'}
                              </span>
                            </div>

                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                              {m.title}
                            </div>
                            {m.agenda && (
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                {m.agenda}
                              </div>
                            )}

                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                              <div>📅 {m.date} &bull; 🕒 {m.time}</div>
                              <div>📍 {m.location}</div>
                            </div>

                            {isDone && (
                              <div style={{ display: 'flex', gap: 6, fontSize: 11, marginBottom: 12, flexWrap: 'wrap' }}>
                                <span style={{ color: '#16a34a', fontWeight: 700 }}>{mHadir} Hadir</span>
                                {mIzin > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}>{mIzin} Izin</span>}
                                {mSakit > 0 && <span style={{ color: '#0284c7', fontWeight: 600 }}>{mSakit} Sakit</span>}
                                {mAlpa > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}>{mAlpa} Alpa</span>}
                              </div>
                            )}

                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                setSelectedMeetingId(m.id);
                                setTab('roster');
                              }}
                              style={{
                                width: '100%',
                                background: '#16a34a',
                                borderColor: '#16a34a',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                fontWeight: 700,
                                padding: '10px 14px',
                                borderRadius: 10,
                              }}
                            >
                              <MdFactCheck style={{ fontSize: 18 }} /> Buka Lembar Ceklis Presensi
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: LEMBAR CEKLIS PRESENSI PER PERTEMUAN */}
          {tab === 'roster' && (() => {
            const hadirCount = rosterData.filter(r => r.status === 'hadir').length;
            const izinCount = rosterData.filter(r => r.status === 'izin').length;
            const sakitCount = rosterData.filter(r => r.status === 'sakit').length;
            const alpaCount = rosterData.filter(r => r.status === 'alpa' || r.status === 'alpha').length;
            const totalRoster = rosterData.length;
            const pctHadir = totalRoster ? Math.round((hadirCount / totalRoster) * 100) : 0;

            const filteredRoster = rosterData.filter(item => {
              const q = checklistSearch.toLowerCase().trim();
              const matchSearch =
                !q ||
                item.name?.toLowerCase().includes(q) ||
                item.nim?.toLowerCase().includes(q) ||
                item.prodi?.toLowerCase().includes(q);

              const matchFilter =
                checklistFilter === 'all' ||
                item.status === checklistFilter ||
                (checklistFilter === 'alpa' && (item.status === 'alpa' || item.status === 'alpha'));

              return matchSearch && matchFilter;
            });

            return (
              <div className="card">
                {/* Back to Meetings button */}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setTab('meetings')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, fontWeight: 700, padding: '6px 12px', borderRadius: 8 }}
                >
                  <MdArrowBack /> Kembali ke Daftar Sesi Pertemuan
                </button>

                {/* Checklist Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        Lembar Ceklis: {meetingDetail?.title || 'Pilih Pertemuan'}
                      </h3>
                      <span className="badge badge-blue" style={{ fontWeight: 800, fontSize: 12, padding: '3px 10px' }}>
                        Sesi #{meetingDetail?.meetingNumber}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                      📅 {meetingDetail?.date} &bull; 🕒 {meetingDetail?.time} &bull; 📍 {meetingDetail?.location}
                    </p>
                  </div>

                  {/* Sesi Switcher Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Pilih Sesi:</span>
                    <select
                      className="input"
                      style={{ width: 'auto', padding: '6px 12px', fontSize: 13, height: 38 }}
                      value={selectedMeetingId || ''}
                      onChange={e => setSelectedMeetingId(Number(e.target.value))}
                    >
                      {meetings.map(m => (
                        <option key={m.id} value={m.id}>
                          #{m.meetingNumber}: {m.title} ({m.date})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Attendance Stats & Batch Action Bar */}
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    padding: '16px 18px',
                    borderRadius: 16,
                    marginBottom: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    {/* Live Counters */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Total {totalRoster} Anggota:
                      </span>
                      <span className="badge badge-green" style={{ fontSize: 12, padding: '4px 10px', fontWeight: 700 }}>
                        ✓ {hadirCount} Hadir ({pctHadir}%)
                      </span>
                      <span className="badge badge-yellow" style={{ fontSize: 12, padding: '4px 10px', fontWeight: 700 }}>
                        {izinCount} Izin
                      </span>
                      <span className="badge badge-blue" style={{ fontSize: 12, padding: '4px 10px', fontWeight: 700 }}>
                        {sakitCount} Sakit
                      </span>
                      <span className="badge badge-red" style={{ fontSize: 12, padding: '4px 10px', fontWeight: 700 }}>
                        {alpaCount} Alpa
                      </span>
                    </div>

                    {/* Batch Actions & Save */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700, borderRadius: 8, border: '1px solid #bbf7d0' }}
                        onClick={() => setAllStatus('hadir')}
                      >
                        ✓ Ceklis Semua Hadir
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 700, borderRadius: 8, border: '1px solid #fecaca' }}
                        onClick={() => setAllStatus('alpa')}
                      >
                        Set Alpa Semua
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSaveRoster}
                        disabled={savingRoster || !rosterData.length}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10, fontWeight: 700 }}
                      >
                        <MdSave /> {savingRoster ? 'Menyimpan...' : 'Simpan Presensi Pertemuan'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Checklist Search & Filter Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                    <MdSearch style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)', fontSize: 18 }} />
                    <input
                      type="text"
                      className="input"
                      placeholder="Cari nama atau NIM anggota..."
                      value={checklistSearch}
                      onChange={e => setChecklistSearch(e.target.value)}
                      style={{ paddingLeft: 38, height: 40, fontSize: 13, background: 'var(--bg-surface)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
                    <button
                      type="button"
                      className={`btn btn-sm ${checklistFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ borderRadius: 8, fontSize: 12, padding: '5px 12px' }}
                      onClick={() => setChecklistFilter('all')}
                    >
                      Semua ({totalRoster})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${checklistFilter === 'hadir' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ borderRadius: 8, fontSize: 12, padding: '5px 12px' }}
                      onClick={() => setChecklistFilter('hadir')}
                    >
                      Hadir ({hadirCount})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${checklistFilter === 'izin' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ borderRadius: 8, fontSize: 12, padding: '5px 12px' }}
                      onClick={() => setChecklistFilter('izin')}
                    >
                      Izin ({izinCount})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${checklistFilter === 'sakit' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ borderRadius: 8, fontSize: 12, padding: '5px 12px' }}
                      onClick={() => setChecklistFilter('sakit')}
                    >
                      Sakit ({sakitCount})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${checklistFilter === 'alpa' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ borderRadius: 8, fontSize: 12, padding: '5px 12px' }}
                      onClick={() => setChecklistFilter('alpa')}
                    >
                      Alpa ({alpaCount})
                    </button>
                  </div>
                </div>

                {/* Roster Checklist Content */}
                {rosterData.length === 0 ? (
                  <div className="empty-state">
                    <div className="icon">👥</div>
                    <p>Belum ada mahasiswa yang terdaftar di UKM ini.</p>
                  </div>
                ) : filteredRoster.length === 0 ? (
                  <div className="empty-state">
                    <div className="icon">🔍</div>
                    <p>Tidak ada mahasiswa yang cocok dengan pencarian / filter.</p>
                  </div>
                ) : (
                  <>
                    {/* 1. Desktop Checklist Table View */}
                    <div className="table-wrap desktop-table-only">
                      <table>
                        <thead>
                          <tr>
                            <th style={{ width: 44, textAlign: 'center' }}>Ceklis</th>
                            <th>#</th>
                            <th>NIM & Mahasiswa</th>
                            <th>Program Studi</th>
                            <th>Status Kehadiran Pertemuan</th>
                            <th>Keterangan / Catatan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRoster.map((item, idx) => {
                            const isHadir = item.status === 'hadir';
                            const isIzin = item.status === 'izin';
                            const isSakit = item.status === 'sakit';
                            const isAlpa = item.status === 'alpa' || item.status === 'alpha';

                            return (
                              <tr
                                key={item.userId}
                                style={{
                                  background: isHadir ? 'rgba(34, 197, 94, 0.05)' : isIzin ? 'rgba(245, 158, 11, 0.05)' : isSakit ? 'rgba(6, 182, 212, 0.05)' : 'transparent',
                                  transition: 'background 0.2s',
                                }}
                              >
                                {/* Quick 1-Click Toggle Checkbox */}
                                <td style={{ textAlign: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={isHadir}
                                    onChange={() => toggleHadir(item.userId)}
                                    title={isHadir ? 'Klik untuk ubah menjadi Alpa' : 'Klik untuk Ceklis Hadir'}
                                    style={{
                                      width: 20,
                                      height: 20,
                                      accentColor: '#16a34a',
                                      cursor: 'pointer',
                                    }}
                                  />
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                                <td>
                                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13.5 }}>
                                    {item.name}
                                  </div>
                                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                                    NIM: {item.nim}
                                  </div>
                                  {item.hasApprovedLeave && (
                                    <span className="badge badge-yellow" style={{ fontSize: 10, padding: '2px 6px', marginTop: 3 }}>
                                      📄 Surat Izin Disetujui
                                    </span>
                                  )}
                                </td>
                                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.prodi}</td>
                                <td>
                                  {/* 4 Multi-Status Buttons */}
                                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      onClick={() => setStudentStatus(item.userId, 'hadir')}
                                      style={{
                                        padding: '5px 12px',
                                        borderRadius: 8,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        border: '1px solid',
                                        borderColor: isHadir ? '#16a34a' : 'var(--border)',
                                        cursor: 'pointer',
                                        background: isHadir ? '#16a34a' : 'var(--bg-surface)',
                                        color: isHadir ? '#ffffff' : 'var(--text-secondary)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        transition: 'all 0.15s ease',
                                      }}
                                    >
                                      <MdCheckCircle style={{ fontSize: 14 }} /> Hadir
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setStudentStatus(item.userId, 'izin')}
                                      style={{
                                        padding: '5px 12px',
                                        borderRadius: 8,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        border: '1px solid',
                                        borderColor: isIzin ? '#d97706' : 'var(--border)',
                                        cursor: 'pointer',
                                        background: isIzin ? '#d97706' : 'var(--bg-surface)',
                                        color: isIzin ? '#ffffff' : 'var(--text-secondary)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        transition: 'all 0.15s ease',
                                      }}
                                    >
                                      <MdEventAvailable style={{ fontSize: 14 }} /> Izin
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setStudentStatus(item.userId, 'sakit')}
                                      style={{
                                        padding: '5px 12px',
                                        borderRadius: 8,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        border: '1px solid',
                                        borderColor: isSakit ? '#0284c7' : 'var(--border)',
                                        cursor: 'pointer',
                                        background: isSakit ? '#0284c7' : 'var(--bg-surface)',
                                        color: isSakit ? '#ffffff' : 'var(--text-secondary)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        transition: 'all 0.15s ease',
                                      }}
                                    >
                                      <MdLocalHospital style={{ fontSize: 14 }} /> Sakit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setStudentStatus(item.userId, 'alpa')}
                                      style={{
                                        padding: '5px 12px',
                                        borderRadius: 8,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        border: '1px solid',
                                        borderColor: isAlpa ? '#dc2626' : 'var(--border)',
                                        cursor: 'pointer',
                                        background: isAlpa ? '#dc2626' : 'var(--bg-surface)',
                                        color: isAlpa ? '#ffffff' : 'var(--text-secondary)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        transition: 'all 0.15s ease',
                                      }}
                                    >
                                      <MdCancel style={{ fontSize: 14 }} /> Alpa
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  <input
                                    className="input"
                                    placeholder="Catatan..."
                                    style={{ height: 34, fontSize: 12, background: 'var(--bg-surface)' }}
                                    value={item.keterangan || ''}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setRosterData(prev =>
                                        prev.map(x => (x.userId === item.userId ? { ...x, keterangan: val } : x))
                                      );
                                    }}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* 2. Mobile Clean Checklist Cards View */}
                    <div className="mobile-cards-only">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filteredRoster.map((item) => {
                          const isHadir = item.status === 'hadir';
                          const isIzin = item.status === 'izin';
                          const isSakit = item.status === 'sakit';
                          const isAlpa = item.status === 'alpa' || item.status === 'alpha';

                          return (
                            <div
                              key={item.userId}
                              className="mobile-tx-card"
                              style={{
                                borderLeft: isHadir ? '4px solid #16a34a' : isIzin ? '4px solid #d97706' : isSakit ? '4px solid #0284c7' : '4px solid #dc2626',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                                    {item.name}
                                  </div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    NIM: {item.nim} &bull; {item.prodi}
                                  </div>
                                </div>
                                <span
                                  className={`badge ${isHadir ? 'badge-green' : isIzin ? 'badge-yellow' : isSakit ? 'badge-blue' : 'badge-red'}`}
                                  style={{ textTransform: 'capitalize', fontWeight: 800 }}
                                >
                                  {item.status}
                                </span>
                              </div>

                              {item.hasApprovedLeave && (
                                <div style={{ fontSize: 11, color: '#b45309', background: '#fef3c7', padding: '4px 8px', borderRadius: 6, marginBottom: 8 }}>
                                  📄 Surat Izin Disetujui
                                </div>
                              )}

                              {/* 4 Touch-friendly Buttons */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
                                <button
                                  type="button"
                                  onClick={() => setStudentStatus(item.userId, 'hadir')}
                                  style={{
                                    padding: '8px 4px',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: isHadir ? '#16a34a' : 'var(--bg-subtle)',
                                    color: isHadir ? '#fff' : 'var(--text-secondary)',
                                    textAlign: 'center',
                                  }}
                                >
                                  Hadir
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStudentStatus(item.userId, 'izin')}
                                  style={{
                                    padding: '8px 4px',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: isIzin ? '#d97706' : 'var(--bg-subtle)',
                                    color: isIzin ? '#fff' : 'var(--text-secondary)',
                                    textAlign: 'center',
                                  }}
                                >
                                  Izin
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStudentStatus(item.userId, 'sakit')}
                                  style={{
                                    padding: '8px 4px',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: isSakit ? '#0284c7' : 'var(--bg-subtle)',
                                    color: isSakit ? '#fff' : 'var(--text-secondary)',
                                    textAlign: 'center',
                                  }}
                                >
                                  Sakit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStudentStatus(item.userId, 'alpa')}
                                  style={{
                                    padding: '8px 4px',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: isAlpa ? '#dc2626' : 'var(--bg-subtle)',
                                    color: isAlpa ? '#fff' : 'var(--text-secondary)',
                                    textAlign: 'center',
                                  }}
                                >
                                  Alpa
                                </button>
                              </div>

                              <input
                                className="input"
                                placeholder="Catatan khusus..."
                                style={{ height: 32, fontSize: 11, width: '100%' }}
                                value={item.keterangan || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setRosterData(prev =>
                                    prev.map(x => (x.userId === item.userId ? { ...x, keterangan: val } : x))
                                  );
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Save Reminder Bar */}
                    <div
                      style={{
                        marginTop: 20,
                        padding: '14px 18px',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Selesai mengecek presensi? Simpan rekaman kehadiran:
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSaveRoster}
                        disabled={savingRoster || !rosterData.length}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, padding: '10px 22px', borderRadius: 10 }}
                      >
                        <MdSave /> {savingRoster ? 'Menyimpan...' : 'Simpan Presensi Pertemuan'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* TAB 3: KOTAK MASUK PERIZINAN MAHASISWA */}
          {tab === 'leave' && (
            <div className="card">
              <div className="flex justify-between items-center" style={{ marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>Kotak Masuk Surat & Pengajuan Izin</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Periksa alasan dan bukti surat izin mahasiswa yang berhalangan hadir.
                  </p>
                </div>
              </div>

              {leaveRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">✉️</div>
                  <p>Tidak ada pengajuan izin yang masuk saat ini.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Mahasiswa</th>
                        <th>Tanggal Izin</th>
                        <th>Sesi Pertemuan</th>
                        <th>Alasan Berhalangan</th>
                        <th>Bukti Surat / Foto</th>
                        <th>Status</th>
                        <th>Aksi Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveRequests.map(l => (
                        <tr key={l.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{l.user?.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.user?.nim} &bull; {l.user?.prodi}</div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{l.date}</td>
                          <td>
                            {l.meeting ? (
                              <span className="badge badge-blue">
                                #{l.meeting.meetingNumber} {l.meeting.title}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Pertemuan Tanggal {l.date}</span>
                            )}
                          </td>
                          <td style={{ maxWidth: 260, lineHeight: 1.5 }}>
                            "{l.reason}"
                          </td>
                          <td>
                            {l.attachment ? (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setProofModalUrl(l.attachment)}
                                style={{ color: 'var(--primary)' }}
                              >
                                <MdVisibility /> Lihat Berkas
                              </button>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tidak ada lampiran</span>
                            )}
                          </td>
                          <td>
                            {l.status === 'approved' ? (
                              <span className="badge badge-green"><MdDoneAll /> Disetujui</span>
                            ) : l.status === 'rejected' ? (
                              <span className="badge badge-red"><MdCancel /> Ditolak</span>
                            ) : (
                              <span className="badge badge-purple">⏳ Menunggu Respon</span>
                            )}
                          </td>
                          <td>
                            {l.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleReviewLeave(l.id, 'approved')}
                                >
                                  Setujui Izin
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleReviewLeave(l.id, 'rejected')}
                                >
                                  Tolak
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {l.reviewNotes || 'Selesai'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal QR Code & Token Presensi */}
      {qrModalItem && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setQrModalItem(null)}>
          <div className="modal" style={{ maxWidth: 480, textAlign: 'center' }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-blue">KODE PRESENSI SESI</span>
                <h3 style={{ marginTop: 4 }}>Check-In Mandiri Mahasiswa</h3>
              </div>
              <button className="modal-close" onClick={() => setQrModalItem(null)}><MdClose /></button>
            </div>

            <div style={{ padding: '16px 0' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                {qrModalItem.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {qrModalItem.date} &bull; {qrModalItem.time} &bull; {qrModalItem.location}
              </div>

              {/* QR Code Graphical Representation */}
              <div
                style={{
                  margin: '20px auto',
                  width: 220,
                  height: 220,
                  background: '#ffffff',
                  padding: 16,
                  borderRadius: 16,
                  border: '2px solid #3b82f6',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {/* SVG Visual QR Mockup */}
                <svg width="180" height="180" viewBox="0 0 100 100" fill="#0f172a">
                  {/* Outer corner finders */}
                  <rect x="5" y="5" width="26" height="26" fill="#1e3a8a" rx="4" />
                  <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                  <rect x="13" y="13" width="10" height="10" fill="#2563eb" rx="1" />

                  <rect x="69" y="5" width="26" height="26" fill="#1e3a8a" rx="4" />
                  <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                  <rect x="77" y="13" width="10" height="10" fill="#2563eb" rx="1" />

                  <rect x="5" y="69" width="26" height="26" fill="#1e3a8a" rx="4" />
                  <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="2" />
                  <rect x="13" y="77" width="10" height="10" fill="#2563eb" rx="1" />

                  {/* QR Data Pattern dots */}
                  <rect x="36" y="8" width="6" height="6" />
                  <rect x="46" y="8" width="6" height="6" />
                  <rect x="56" y="8" width="6" height="6" />
                  <rect x="36" y="18" width="6" height="6" />
                  <rect x="50" y="18" width="12" height="6" />
                  <rect x="8" y="36" width="6" height="6" />
                  <rect x="18" y="36" width="6" height="6" />
                  <rect x="28" y="36" width="6" height="6" />
                  <rect x="40" y="36" width="20" height="20" fill="#3b82f6" rx="4" />
                  <rect x="68" y="36" width="8" height="8" />
                  <rect x="82" y="36" width="8" height="8" />
                  <rect x="8" y="48" width="14" height="6" />
                  <rect x="72" y="48" width="18" height="6" />
                  <rect x="8" y="58" width="8" height="6" />
                  <rect x="22" y="58" width="12" height="6" />
                  <rect x="68" y="58" width="8" height="6" />
                  <rect x="82" y="58" width="8" height="6" />
                  <rect x="36" y="68" width="10" height="8" />
                  <rect x="52" y="68" width="8" height="8" />
                  <rect x="68" y="68" width="10" height="8" />
                  <rect x="84" y="68" width="8" height="8" />
                  <rect x="36" y="82" width="20" height="8" />
                  <rect x="62" y="82" width="14" height="8" />
                  <rect x="82" y="82" width="10" height="8" />
                </svg>
              </div>

              {/* Big Token Display */}
              <div
                style={{
                  background: 'var(--bg-main)',
                  border: '1px dashed var(--primary)',
                  padding: '14px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  margin: '0 auto',
                  maxWidth: 340,
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>TOKEN PRESENSI MANDIRI</div>
                  <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 2, color: 'var(--primary)', fontFamily: 'monospace' }}>
                    {qrModalItem.qrToken}
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => copyToken(qrModalItem.qrToken)}
                >
                  <MdContentCopy /> Salin
                </button>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 14 }}>
                Tampilkan layar ini di depan kelas/lab atau proyektor. Mahasiswa dapat membuka portal mereka dan memasukkan token ini untuk check-in otomatis.
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setQrModalItem(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Bukti Dokumen Surat Izin */}
      {proofModalUrl && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setProofModalUrl(null)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>Lampiran Bukti Surat Izin / Sakit</h3>
              <button className="modal-close" onClick={() => setProofModalUrl(null)}><MdClose /></button>
            </div>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <img
                src={proofModalUrl}
                alt="Bukti Izin"
                style={{ maxWidth: '100%', maxHeight: 450, borderRadius: 10, border: '1px solid var(--border)' }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setProofModalUrl(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Pertemuan Baru */}
      {meetingModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setMeetingModal(false)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-blue" style={{ marginBottom: 4 }}>Jadwal Sesi</span>
                <h3>Buat Sesi Pertemuan UKM Baru</h3>
              </div>
              <button className="modal-close" onClick={() => setMeetingModal(false)}>
                <MdClose />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 12 }}>
                <div className="form-group">
                  <label>Nomor Sesi</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="Contoh: 7"
                    value={newMeeting.meetingNumber}
                    onChange={e => setNewMeeting({ ...newMeeting, meetingNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Judul / Topik Pertemuan</label>
                  <input
                    className="input"
                    placeholder="Contoh: Pertemuan 7: Workshop Tailwind CSS"
                    value={newMeeting.title}
                    onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    className="input"
                    value={newMeeting.date}
                    onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Waktu / Jam</label>
                  <input
                    className="input"
                    placeholder="15:00 - 17:30 WITA"
                    value={newMeeting.time}
                    onChange={e => setNewMeeting({ ...newMeeting, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Lokasi Pertemuan</label>
                <input
                  className="input"
                  placeholder="Lab Komputer 1 / GOR Futsal / Aula"
                  value={newMeeting.location}
                  onChange={e => setNewMeeting({ ...newMeeting, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Rencana Materi / Agenda Kegiatan</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Materi yang akan dipelajari dan dipraktikkan oleh anggota..."
                  value={newMeeting.agenda}
                  onChange={e => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setMeetingModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <MdAdd /> Simpan Sesi Pertemuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
