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
  MdContentCopy, MdVisibility, MdPrint, MdSearch, MdNorthEast
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
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16, overflowX: 'auto' }}>
            <button
              className={`btn ${tab === 'meetings' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('meetings')}
              style={{ borderRadius: 12, padding: '9px 20px', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <MdCalendarToday /> Daftar Sesi Pertemuan ({meetings.length})
            </button>

            <button
              className={`btn ${tab === 'roster' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('roster')}
              style={{ borderRadius: 12, padding: '9px 20px', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <MdFactCheck /> Lembar Presensi Roster
            </button>

            <button
              className={`btn ${tab === 'leave' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('leave')}
              style={{ borderRadius: 12, padding: '9px 20px', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, position: 'relative' }}
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
              <div className="flex justify-between items-center" style={{ marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>Daftar Sesi Pertemuan {activeUkm?.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Bagikan Token QR kepada mahasiswa agar mereka dapat melakukan Check-In mandiri.
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setMeetingModal(true)}>
                  <MdAdd /> Tambah Sesi
                </button>
              </div>

              {meetings.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📅</div>
                  <p>Belum ada sesi pertemuan. Klik tombol di atas untuk membuat pertemuan pertama!</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Sesi</th>
                        <th>Agenda & Judul Pertemuan</th>
                        <th>Jadwal & Tempat</th>
                        <th>Token Presensi Mandiri</th>
                        <th>Rekap Kehadiran</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.map(m => {
                        const hadirCount = m.attendances?.filter(a => a.status === 'hadir').length || 0;
                        const izinCount = m.attendances?.filter(a => a.status === 'izin').length || 0;
                        const alphaCount = m.attendances?.filter(a => a.status === 'alpha').length || 0;

                        return (
                          <tr key={m.id}>
                            <td>
                              <span style={{ fontWeight: 800, color: 'var(--primary)', background: '#eff6ff', padding: '4px 10px', borderRadius: 8 }}>
                                #{m.meetingNumber}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.title}</div>
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span
                                  className="badge badge-purple"
                                  style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, letterSpacing: 0.5 }}
                                >
                                  {m.qrToken || `UKM${activeId}-M${m.meetingNumber}`}
                                </span>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  style={{ padding: '4px 8px' }}
                                  onClick={() => setQrModalItem(m)}
                                  title="Tampilkan QR & Token Presensi"
                                >
                                  <MdQrCode style={{ fontSize: 16 }} />
                                </button>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <span className="badge badge-green">{hadirCount} Hadir</span>
                                <span className="badge badge-yellow">{izinCount} Izin</span>
                                <span className="badge badge-red">{alphaCount} Alpha</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => {
                                    setSelectedMeetingId(m.id);
                                    setTab('roster');
                                  }}
                                >
                                  <MdFactCheck /> Absen Roster
                                </button>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => setQrModalItem(m)}
                                >
                                  <MdQrCode /> QR Sesi
                                </button>
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
          )}

          {/* TAB 2: LEMBAR PRESENSI ANGGOTA (ROSTER) */}
          {tab === 'roster' && (
            <div className="card">
              <div className="flex justify-between items-center" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>
                    Lembar Absensi: {meetingDetail?.title || 'Pilih Pertemuan'}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Pilih status kehadiran setiap mahasiswa, lalu klik "Simpan Presensi".
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <select
                    className="input"
                    style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
                    value={selectedMeetingId || ''}
                    onChange={e => setSelectedMeetingId(Number(e.target.value))}
                  >
                    {meetings.map(m => (
                      <option key={m.id} value={m.id}>
                        Pertemuan #{m.meetingNumber}: {m.title} ({m.date})
                      </option>
                    ))}
                  </select>

                  {meetingDetail && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setQrModalItem(meetingDetail)}
                    >
                      <MdQrCode /> Tampilkan QR Sesi
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-main)',
                  padding: '12px 16px',
                  borderRadius: 12,
                  marginBottom: 18,
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span>Set Semua Anggota Menjadi:</span>
                  <button className="btn btn-sm" style={{ background: '#dcfce7', color: '#15803d' }} onClick={() => setAllStatus('hadir')}>
                    Hadir Semua
                  </button>
                  <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#b91c1c' }} onClick={() => setAllStatus('alpha')}>
                    Alpha Semua
                  </button>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleSaveRoster}
                  disabled={savingRoster || !rosterData.length}
                >
                  <MdSave /> {savingRoster ? 'Menyimpan...' : 'Simpan Presensi Pertemuan'}
                </button>
              </div>

              {/* Roster Table */}
              {rosterData.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">👥</div>
                  <p>Belum ada mahasiswa yang terdaftar di UKM ini.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>NIM</th>
                        <th>Nama Mahasiswa</th>
                        <th>Program Studi</th>
                        <th>Status Presensi</th>
                        <th>Keterangan Tambahan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rosterData.map((item, idx) => (
                        <tr key={item.userId}>
                          <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>{item.nim}</td>
                          <td style={{ fontWeight: 600 }}>{item.name}</td>
                          <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.prodi}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => setStudentStatus(item.userId, 'hadir')}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: item.status === 'hadir' ? '#16a34a' : 'var(--bg-main)',
                                  color: item.status === 'hadir' ? '#fff' : 'var(--text-muted)',
                                }}
                              >
                                Hadir
                              </button>
                              <button
                                type="button"
                                onClick={() => setStudentStatus(item.userId, 'izin')}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: item.status === 'izin' ? '#d97706' : 'var(--bg-main)',
                                  color: item.status === 'izin' ? '#fff' : 'var(--text-muted)',
                                }}
                              >
                                Izin
                              </button>
                              <button
                                type="button"
                                onClick={() => setStudentStatus(item.userId, 'alpha')}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: item.status === 'alpha' ? '#dc2626' : 'var(--bg-main)',
                                  color: item.status === 'alpha' ? '#fff' : 'var(--text-muted)',
                                }}
                              >
                                Alpha
                              </button>
                            </div>
                          </td>
                          <td>
                            <input
                              className="input"
                              placeholder="Catatan..."
                              style={{ height: 32, fontSize: 12 }}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

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
