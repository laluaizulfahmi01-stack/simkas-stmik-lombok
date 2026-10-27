// src/pages/student/AbsenPage.jsx - Rekap Absen Bulanan & Check-In Mandiri & Pengajuan Izin
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import ProPageHeader from '../../components/ProPageHeader';
import api from '../../api/axios';
import { useToast } from '../../components/Toast';
import {
  MdFactCheck, MdCheckCircle, MdCancel, MdEventAvailable,
  MdMail, MdClose, MdSchedule, MdPlace, MdCalendarToday,
  MdSend, MdHourglassEmpty, MdDoneAll, MdQrCode, MdCloudUpload,
  MdVisibility
} from 'react-icons/md';

export default function StudentAbsenPage() {
  const { user, activeUkmId, setActiveUkmId } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [leaveModal, setLeaveModal] = useState(false);
  const [checkInModal, setCheckInModal] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);

  // Leave Form
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    date: new Date().toISOString().split('T')[0],
    meetingId: '',
    reason: '',
    attachment: null,
  });

  // Check-In Form
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  const [checkInToken, setCheckInToken] = useState('');
  const [selectedMeetingForCheckIn, setSelectedMeetingForCheckIn] = useState('');

  const toast = useToast();
  const ukms = user?.ukms || [];
  const activeUkm = ukms.find(u => u.id === activeUkmId) || ukms[0];

  useEffect(() => {
    if (!activeUkmId && ukms.length > 0) {
      setActiveUkmId(ukms[0].id);
    }
  }, [activeUkmId, ukms, setActiveUkmId]);

  const loadData = () => {
    const idToUse = activeUkmId || ukms[0]?.id;
    if (!idToUse) return;
    setLoading(true);
    api.get(`/attendance/${idToUse}/student-overview`)
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, [activeUkmId]);

  // Handle Check-In Mandiri
  const handleCheckInSubmit = async e => {
    e.preventDefault();
    if (!checkInToken.trim()) {
      return toast('Harap masukkan kode token presensi', 'error');
    }
    setSubmittingCheckIn(true);
    try {
      const res = await api.post(`/attendance/${activeUkmId}/check-in`, {
        token: checkInToken.trim(),
        meetingId: selectedMeetingForCheckIn ? Number(selectedMeetingForCheckIn) : undefined,
      });
      toast(res.data.message || 'Presensi berhasil dicatat! 🎉', 'success');
      setCheckInModal(false);
      setCheckInToken('');
      setSelectedMeetingForCheckIn('');
      loadData();
    } catch (err) {
      toast(err.response?.data?.message || 'Kode token tidak valid atau terjadi kesalahan', 'error');
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  // Handle Leave Submit
  const handleLeaveSubmit = async e => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      return toast('Harap isi alasan berhalangan hadir', 'error');
    }
    setSubmittingLeave(true);
    try {
      await api.post(`/attendance/${activeUkmId}/leave-requests`, {
        date: leaveForm.date,
        meetingId: leaveForm.meetingId ? Number(leaveForm.meetingId) : null,
        reason: leaveForm.reason,
        attachment: leaveForm.attachment,
      });
      toast('Pengajuan izin berhasil dikirim ke pengelola UKM! ✉️', 'success');
      setLeaveModal(false);
      setLeaveForm({
        date: new Date().toISOString().split('T')[0],
        meetingId: '',
        reason: '',
        attachment: null,
      });
      loadData();
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal mengajukan izin', 'error');
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Convert uploaded attachment file to base64
  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return toast('Ukuran berkas maksimal 5 MB', 'error');
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLeaveForm(prev => ({ ...prev, attachment: reader.result }));
      toast('Bukti surat berhasil dilampirkan 📎', 'success');
    };
    reader.readAsDataURL(file);
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'hadir':
        return <span className="badge badge-green"><MdCheckCircle /> Hadir</span>;
      case 'izin':
        return <span className="badge badge-yellow"><MdEventAvailable /> Izin</span>;
      case 'alpha':
        return <span className="badge badge-red"><MdCancel /> Alpha</span>;
      case 'menunggu_persetujuan_izin':
        return <span className="badge badge-purple"><MdHourglassEmpty /> Menunggu ACC Izin</span>;
      default:
        return <span className="badge badge-gray">⏳ Belum Diabsen</span>;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ProPageHeader
          title="Presensi & Rekap Kehadiran"
          subtitle={`Check-in mandiri, status izin & riwayat kehadiran pada ${activeUkm?.name || 'UKM STMIK Lombok'}`}
          pillBadge="Presensi Digital"
          pillColor="indigo"
          actions={
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setLeaveModal(true)}
                style={{ borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <MdMail /> Ajukan Izin
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setCheckInModal(true)}
                style={{ borderRadius: 12, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
              >
                <MdQrCode style={{ fontSize: 18 }} /> Check-In Mandiri
              </button>
            </div>
          }
          subbar={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Pilih UKM:</span>
              <div className="ukm-switcher" style={{ margin: 0 }}>
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
            </div>
          }
        />

        <div className="main-content">
          {/* Banner Informasi & Fast Check-In Action */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
              border: '1px solid #bfdbfe',
              padding: '20px 24px',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: 6 }}>
                  📢 PRESENSI DIGITAL {activeUkm?.name}
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  Check-In Sesi Kegiatan UKM Hari Ini
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 640, marginTop: 4, lineHeight: 1.5 }}>
                  Masukkan Kode Token yang dibagikan pengurus di layar proyektor / lab untuk mencatat kehadiran Anda.
                  Jika berhalangan hadir karena sakit atau ada tugas, ajukan izin dengan melampirkan bukti surat.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => setLeaveModal(true)}>
                  <MdMail /> Ajukan Izin
                </button>
                <button className="btn btn-primary" onClick={() => setCheckInModal(true)}>
                  <MdQrCode /> Check-In Presensi
                </button>
              </div>
            </div>
          </div>

          {/* Statistik Kehadiran Bulanan */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                <MdCheckCircle />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL HADIR</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#15803d' }}>
                  {data?.totalHadir || 0} Sesi
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                <MdEventAvailable />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL IZIN</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#b45309' }}>
                  {data?.totalIzin || 0} Sesi
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                <MdCancel />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>ALPHA</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#b91c1c' }}>
                  {data?.totalAlpha || 0} Sesi
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                <MdFactCheck />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>PERSENTASE HADIR</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1d4ed8' }}>
                  {data?.percentage || 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Daftar Seluruh Pertemuan Bulanan */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>Daftar Pertemuan & Status Kehadiran Real-Time</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Total {data?.totalMeetings || 0} sesi pertemuan terdaftar pada UKM {activeUkm?.name}
                </p>
              </div>

              <button className="btn btn-primary btn-sm" onClick={() => setCheckInModal(true)}>
                <MdQrCode /> Check-In Sekarang
              </button>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="icon">⏳</div>
                <p>Memuat rekap kehadiran...</p>
              </div>
            ) : data?.meetings?.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📅</div>
                <p>Belum ada sesi pertemuan yang dibuat oleh pengelola.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Sesi</th>
                      <th>Agenda & Materi Pertemuan</th>
                      <th>Jadwal & Lokasi</th>
                      <th>Status Kehadiran</th>
                      <th>Keterangan / Catatan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.meetings.map(m => (
                      <tr key={m.meetingId}>
                        <td>
                          <span
                            style={{
                              background: '#eff6ff',
                              color: 'var(--primary)',
                              padding: '4px 10px',
                              borderRadius: 8,
                              fontWeight: 800,
                              fontSize: 12,
                            }}
                          >
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
                          <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MdCalendarToday style={{ color: 'var(--text-muted)' }} /> {m.date}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <MdSchedule /> {m.time} &bull; <MdPlace /> {m.location}
                          </div>
                        </td>
                        <td>{getStatusBadge(m.myStatus)}</td>
                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          {m.keterangan || '-'}
                        </td>
                        <td>
                          {m.myStatus === 'hadir' ? (
                            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MdDoneAll /> Tercatat
                            </span>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedMeetingForCheckIn(m.meetingId);
                                if (m.qrToken) setCheckInToken(m.qrToken);
                                setCheckInModal(true);
                              }}
                            >
                              Check-In
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Riwayat Pengajuan Izin Mahasiswa */}
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>Riwayat Pengajuan Izin Anda</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Status persetujuan surat/alasan tidak hadir yang telah Anda ajukan
                </p>
              </div>

              <button className="btn btn-ghost btn-sm" onClick={() => setLeaveModal(true)}>
                <MdMail /> Ajukan Izin Baru
              </button>
            </div>

            {!data?.leaveRequests || data.leaveRequests.length === 0 ? (
              <div className="empty-state">
                <div className="icon">✉️</div>
                <p>Belum ada riwayat pengajuan izin yang dikirimkan.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tanggal Izin</th>
                      <th>Alasan Berhalangan</th>
                      <th>Lampiran Surat</th>
                      <th>Status Pengajuan</th>
                      <th>Respon Pengelola</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leaveRequests.map(l => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 600 }}>{l.date}</td>
                        <td style={{ maxWidth: 300, lineHeight: 1.5 }}>
                          "{l.reason}"
                        </td>
                        <td>
                          {l.attachment ? (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setPreviewAttachment(l.attachment)}
                            >
                              <MdVisibility /> Pratinjau
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                        <td>
                          {l.status === 'approved' ? (
                            <span className="badge badge-green"><MdDoneAll /> Disetujui</span>
                          ) : l.status === 'rejected' ? (
                            <span className="badge badge-red"><MdCancel /> Ditolak</span>
                          ) : (
                            <span className="badge badge-purple">⏳ Menunggu Peninjauan</span>
                          )}
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          {l.reviewNotes || (l.status === 'pending' ? 'Belum ditinjau pengurus' : '-')}
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

      {/* Modal Check-In Mandiri */}
      {checkInModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCheckInModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-blue">PRESENSI MANDIRI</span>
                <h3 style={{ marginTop: 4 }}>Check-In Kehadiran Sesi</h3>
              </div>
              <button className="modal-close" onClick={() => setCheckInModal(false)}><MdClose /></button>
            </div>

            <form onSubmit={handleCheckInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Pilih Sesi Pertemuan</label>
                <select
                  className="input"
                  value={selectedMeetingForCheckIn}
                  onChange={e => {
                    setSelectedMeetingForCheckIn(e.target.value);
                    const found = data?.meetings?.find(m => m.meetingId === Number(e.target.value));
                    if (found?.qrToken) setCheckInToken(found.qrToken);
                  }}
                >
                  <option value="">-- Pertemuan Hari Ini / Terbuka --</option>
                  {data?.meetings?.map(m => (
                    <option key={m.meetingId} value={m.meetingId}>
                      #{m.meetingNumber}: {m.title} ({m.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Masukkan Kode Token Presensi</label>
                <input
                  className="input"
                  placeholder="Contoh: UKM1-M1-XXXX"
                  value={checkInToken}
                  onChange={e => setCheckInToken(e.target.value.toUpperCase())}
                  style={{ fontFamily: 'monospace', letterSpacing: 2, fontSize: 16, fontWeight: 700 }}
                  required
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Kode token diberikan oleh pengelola UKM pada layar proyektor / sesi kegiatan.
                </span>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setCheckInModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingCheckIn}>
                  <MdCheckCircle /> {submittingCheckIn ? 'Memproses...' : 'Konfirmasi Hadir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajukan Izin */}
      {leaveModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setLeaveModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-yellow">FORMULIR PERIZINAN</span>
                <h3 style={{ marginTop: 4 }}>Pengajuan Izin Tidak Hadir</h3>
              </div>
              <button className="modal-close" onClick={() => setLeaveModal(false)}><MdClose /></button>
            </div>

            <form onSubmit={handleLeaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Tanggal Berhalangan Hadir</label>
                <input
                  type="date"
                  className="input"
                  value={leaveForm.date}
                  onChange={e => setLeaveForm({ ...leaveForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Sesi Pertemuan yang Dituju (Opsional)</label>
                <select
                  className="input"
                  value={leaveForm.meetingId}
                  onChange={e => setLeaveForm({ ...leaveForm, meetingId: e.target.value })}
                >
                  <option value="">-- Pilih Sesi Pertemuan (Jika Ada) --</option>
                  {data?.meetings?.map(m => (
                    <option key={m.meetingId} value={m.meetingId}>
                      Pertemuan #{m.meetingNumber}: {m.title} ({m.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Alasan Berhalangan Hadir</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Contoh: Mengalami demam / menghadiri acara keluarga..."
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Lampiran Bukti Surat (Surat Dokter / Keterangan)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="input"
                  onChange={handleFileChange}
                  style={{ paddingTop: 6 }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Format gambar JPG, PNG atau foto surat izin (maksimal 5 MB).
                </span>
              </div>

              {leaveForm.attachment && (
                <div style={{ marginTop: 4 }}>
                  <img
                    src={leaveForm.attachment}
                    alt="Pratinjau Bukti"
                    style={{ maxHeight: 120, borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setLeaveModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingLeave}>
                  <MdSend /> {submittingLeave ? 'Mengirim...' : 'Kirim Permohonan Izin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pratinjau Lampiran Bukti */}
      {previewAttachment && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPreviewAttachment(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3>Lampiran Surat Izin</h3>
              <button className="modal-close" onClick={() => setPreviewAttachment(null)}><MdClose /></button>
            </div>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <img
                src={previewAttachment}
                alt="Lampiran Surat"
                style={{ maxWidth: '100%', maxHeight: 450, borderRadius: 8, border: '1px solid var(--border)' }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setPreviewAttachment(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
