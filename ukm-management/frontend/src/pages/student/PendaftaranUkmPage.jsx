// src/pages/student/PendaftaranUkmPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ProPageHeader from '../../components/ProPageHeader';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import {
  MdHowToReg, MdCheckCircle, MdCancel, MdHourglassTop,
  MdUploadFile, MdInfo, MdClose, MdEventAvailable,
  MdOutlineSend, MdOutlineWarningAmber, MdSearch
} from 'react-icons/md';

export default function PendaftaranUkmPage() {
  const { user, login } = useAuth();
  const toast = useToast();

  const [ukms, setUkms] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('katalog'); // 'katalog' | 'riwayat'

  // Apply Modal State
  const [selectedUkm, setSelectedUkm] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // KTM Upload Modal State
  const [ktmModal, setKtmModal] = useState(false);
  const [ktmFile, setKtmFile] = useState(null);
  const [ktmPreview, setKtmPreview] = useState(null);
  const [uploadingKtm, setUploadingKtm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ukmRes, appsRes] = await Promise.all([
        api.get('/ukm'),
        api.get('/applications/my').catch(() => ({ data: [] })),
      ]);
      setUkms(ukmRes.data);
      setMyApps(appsRes.data);
    } catch {
      toast('Gagal memuat data pendaftaran', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Hitung total keanggotaan & pendaftaran aktif (FR-PND-03 [K]: maks 2 UKM)
  const currentMembershipsCount = user?.ukms?.length || 0;
  const activeAppsCount = myApps.filter(a => ['diajukan', 'dalam_seleksi'].includes(a.status)).length;
  const totalCommitments = currentMembershipsCount + activeAppsCount;
  const maxReached = totalCommitments >= 2;

  // Handle Apply
  const handleApply = async e => {
    e.preventDefault();
    if (!selectedUkm) return;
    if (!user?.isVerified) {
      return toast('Akun Anda belum terverifikasi KTM. Silakan upload KTM terlebih dahulu.', 'error');
    }
    if (maxReached) {
      return toast('Batas maksimal kuota 2 UKM telah tercapai.', 'error');
    }

    setSubmitting(true);
    try {
      const res = await api.post('/applications', {
        ukmId: selectedUkm.id,
        motivation,
      });
      toast(res.data.message || 'Pendaftaran berhasil diajukan!', 'success');
      setSelectedUkm(null);
      setMotivation('');
      loadData();
      setActiveTab('riwayat');
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal mengajukan pendaftaran', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Cancel Application (FR-PND-05)
  const handleCancel = async id => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pengajuan pendaftaran ini? Kuota pendaftaran Anda akan dikembalikan.')) return;
    try {
      const res = await api.put(`/applications/${id}/cancel`, { reason: 'Dibatalkan sendiri oleh mahasiswa pemohon' });
      toast(res.data.message || 'Pendaftaran berhasil dibatalkan', 'success');
      loadData();
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal membatalkan pendaftaran', 'error');
    }
  };

  // Handle KTM file change
  const handleKtmChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast('Ukuran foto maksimal 5 MB', 'error');
    const reader = new FileReader();
    reader.onload = ev => {
      setKtmPreview(ev.target.result);
      setKtmFile(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit KTM
  const submitKtm = async e => {
    e.preventDefault();
    if (!ktmFile) return toast('Pilih foto KTM terlebih dahulu', 'error');
    setUploadingKtm(true);
    try {
      await api.post('/profile/verify', { document: ktmFile, note: 'Pengajuan verifikasi KTM mandiri oleh mahasiswa' });
      toast('Foto KTM berhasil diunggah! Menunggu peninjauan pengelola/admin.', 'success');
      setKtmModal(false);
      setKtmFile(null);
      setKtmPreview(null);
      // Reload profile to update status
      const profRes = await api.get('/profile');
      if (profRes.data) {
        const token = localStorage.getItem('token');
        login(token, profRes.data);
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal mengunggah foto KTM', 'error');
    } finally {
      setUploadingKtm(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ProPageHeader
          title="Pendaftaran UKM (Open Recruitment)"
          subtitle="Jelajahi dan daftarkan diri Anda pada Unit Kegiatan Mahasiswa resmi STMIK Lombok"
          pillBadge={`Kuota: ${totalCommitments}/2 UKM`}
          pillColor={totalCommitments >= 2 ? 'rose' : 'indigo'}
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              {!user?.isVerified && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setKtmModal(true)}
                  style={{ borderRadius: 9999, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <MdUploadFile style={{ fontSize: 18 }} />
                  {user?.verificationStatus === 'pending' ? 'Perbarui KTM' : 'Unggah Foto KTM'}
                </button>
              )}
            </div>
          }
        />

        <div className="main-content">
          {/* Status Verifikasi Akun Banner (FR-AKN-04 & FR-PND-06) */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 16,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              background: user?.isVerified
                ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                : user?.verificationStatus === 'pending'
                ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                : 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
              border: `1px solid ${
                user?.isVerified ? '#86efac' : user?.verificationStatus === 'pending' ? '#fde68a' : '#fecdd3'
              }`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  background: user?.isVerified ? '#22c55e' : user?.verificationStatus === 'pending' ? '#f59e0b' : '#ef4444',
                  color: '#fff',
                }}
              >
                {user?.isVerified ? <MdCheckCircle /> : user?.verificationStatus === 'pending' ? <MdHourglassTop /> : <MdOutlineWarningAmber />}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>
                  {user?.isVerified
                    ? 'Identitas Terverifikasi (KTM Valid)'
                    : user?.verificationStatus === 'pending'
                    ? 'Menunggu Verifikasi KTM oleh Pengelola'
                    : 'Akun Belum Terverifikasi KTM'}
                </div>
                <div style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>
                  {user?.isVerified
                    ? `NIM: ${user.nim} · Anda berhak mendaftar hingga 2 UKM pilihan di STMIK Lombok.`
                    : user?.verificationStatus === 'pending'
                    ? 'Dokumen KTM Anda telah diajukan dan sedang ditinjau. Anda dapat mendaftar UKM setelah disetujui.'
                    : 'Sesuai aturan PRD (FR-PND-06), mahasiswa wajib mengunggah KTM sebelum dapat mendaftar ke UKM.'}
                </div>
              </div>
            </div>

            {!user?.isVerified && (
              <button
                className="btn btn-sm"
                onClick={() => setKtmModal(true)}
                style={{
                  background: user?.verificationStatus === 'pending' ? '#d97706' : '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <MdUploadFile style={{ marginRight: 6 }} />
                {user?.verificationStatus === 'pending' ? 'Ganti Foto KTM' : 'Unggah Foto KTM Sekarang'}
              </button>
            )}
          </div>

          {/* Banner Kebijakan Pendaftaran Tahunan (1x Setahun Setiap Tahun Ajaran Baru) */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 14,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
              border: '1px solid #bfdbfe',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#2563eb',
                  color: '#fff',
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                <MdEventAvailable />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span>Periode Pendaftaran: 1 Kali Setahun (Tahun Ajaran Baru 2026/2027)</span>
                  <span style={{ fontSize: 11, background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                    Batch Resmi
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: '#475569', marginTop: 2 }}>
                  Pendaftaran UKM STMIK Lombok diselenggarakan hanya <strong>1 kali dalam 1 tahun</strong> pada setiap Tahun Ajaran Baru. Pastikan Anda memilih maksimal 2 UKM terbaik sebelum periode gelombang pendaftaran ditutup.
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
            <button
              onClick={() => setActiveTab('katalog')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'katalog' ? '2px solid var(--primary)' : '2px solid transparent',
                padding: '8px 16px',
                fontWeight: activeTab === 'katalog' ? 800 : 600,
                color: activeTab === 'katalog' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <MdEventAvailable /> Katalog Open Recruitment ({ukms.length})
            </button>

            <button
              onClick={() => setActiveTab('riwayat')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'riwayat' ? '2px solid var(--primary)' : '2px solid transparent',
                padding: '8px 16px',
                fontWeight: activeTab === 'riwayat' ? 800 : 600,
                color: activeTab === 'riwayat' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <MdHowToReg /> Status Pendaftaran Saya ({myApps.length})
            </button>
          </div>

          {/* TAB 1: KATALOG UKM OPEN RECRUITMENT */}
          {activeTab === 'katalog' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
                {ukms.map(ukm => {
                  const isMember = user?.ukms?.some(u => u.id === ukm.id);
                  const existingApp = myApps.find(a => a.ukmId === ukm.id && !['ditolak', 'dibatalkan'].includes(a.status));
                  const isPending = existingApp?.status === 'diajukan' || existingApp?.status === 'dalam_seleksi';
                  const isOpen = ukm.registrationOpen;

                  return (
                    <div
                      key={ukm.id}
                      className="card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: isMember
                          ? '2px solid #2563eb'
                          : isPending
                          ? '2px solid #f59e0b'
                          : '1px solid var(--border)',
                        position: 'relative',
                        borderRadius: 18,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Top Header Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 700,
                              background: isOpen ? '#dcfce7' : '#f3f4f6',
                              color: isOpen ? '#15803d' : '#6b7280',
                              marginBottom: 6,
                            }}
                          >
                            {isOpen ? '🟢 Open Recruitment' : '⚪ Pendaftaran Tutup'}
                          </span>
                          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                            {ukm.name}
                          </h3>
                        </div>

                        {isMember && (
                          <span className="badge badge-blue" style={{ fontSize: 11, padding: '4px 10px' }}>
                            Anggota Resmi
                          </span>
                        )}
                        {isPending && (
                          <span className="badge badge-yellow" style={{ fontSize: 11, padding: '4px 10px' }}>
                            {existingApp.status === 'dalam_seleksi' ? 'Dalam Seleksi' : 'Menunggu Review'}
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                        {ukm.description || 'Unit kegiatan mahasiswa resmi STMIK Lombok.'}
                      </p>

                      {/* Periode Info */}
                      <div
                        style={{
                          background: 'var(--bg-subtle)',
                          padding: '10px 14px',
                          borderRadius: 12,
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          marginBottom: 16,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <MdEventAvailable style={{ fontSize: 18, color: 'var(--primary)' }} />
                        <span>
                          {isOpen
                            ? `Periode: ${ukm.registrationOpenDate || 'Sekarang'} s/d ${ukm.registrationCloseDate || 'Penutupan Gelombang'}`
                            : 'Pendaftaran gelombang ini belum dibuka.'}
                        </span>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isMember ? (
                          <Link
                            to="/student"
                            className="btn btn-ghost w-full"
                            style={{ justifyContent: 'center', fontWeight: 700 }}
                          >
                            Buka Dashboard UKM
                          </Link>
                        ) : isPending ? (
                          <button
                            className="btn btn-ghost w-full"
                            onClick={() => setActiveTab('riwayat')}
                            style={{ justifyContent: 'center', color: '#d97706', fontWeight: 700 }}
                          >
                            Lihat Status Pengajuan
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary w-full"
                            disabled={!isOpen || !user?.isVerified || maxReached}
                            onClick={() => {
                              setSelectedUkm(ukm);
                              setMotivation('');
                            }}
                            style={{
                              justifyContent: 'center',
                              fontWeight: 700,
                              borderRadius: 12,
                              padding: '10px',
                            }}
                          >
                            <MdOutlineSend style={{ marginRight: 6 }} />
                            {!user?.isVerified
                              ? 'Verifikasi KTM untuk Mendaftar'
                              : maxReached
                              ? 'Kuota Maksimal 2 UKM Penuh'
                              : !isOpen
                              ? 'Pendaftaran Ditutup'
                              : 'Daftar UKM Ini'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT & STATUS PENDAFTARAN MAHASISWA (FR-PND-04..05) */}
          {activeTab === 'riwayat' && (
            <div className="card">
              <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>Riwayat Pendaftaran UKM Saya</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Pantau status seleksi pendaftaran Anda oleh pengelola UKM (FR-PND-04)
                  </p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={loadData}>
                  Segarkan Data
                </button>
              </div>

              {myApps.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📝</div>
                  <h4 style={{ fontWeight: 700 }}>Belum Ada Pengajuan Pendaftaran</h4>
                  <p style={{ maxWidth: 420, margin: '6px auto 14px' }}>
                    Anda belum pernah mengajukan pendaftaran ke UKM mana pun. Buka katalog Open Recruitment untuk memilih UKM yang diminati.
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('katalog')}>
                    Lihat Katalog UKM
                  </button>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>UKM Pilihan</th>
                        <th>Tanggal Pengajuan</th>
                        <th>Motivasi / Alasan</th>
                        <th>Status Seleksi</th>
                        <th>Catatan Pengelola</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myApps.map((app, index) => {
                        const canCancel = ['diajukan', 'dalam_seleksi'].includes(app.status);
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

                        const statusLabel =
                          app.status === 'diterima'
                            ? '✓ Diterima (Anggota Resmi)'
                            : app.status === 'dalam_seleksi'
                            ? '⏳ Dalam Seleksi'
                            : app.status === 'diajukan'
                            ? '✉ Diajukan'
                            : app.status === 'ditolak'
                            ? '✕ Ditolak'
                            : 'Dibatalkan';

                        return (
                          <tr key={app.id}>
                            <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                            <td style={{ fontWeight: 700 }}>{app.ukm?.name || 'UKM'}</td>
                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                              {new Date(app.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td style={{ maxWidth: 240, fontSize: 13, color: 'var(--text-primary)' }}>
                              {app.motivation || '-'}
                            </td>
                            <td>
                              <span className={`badge ${statusBadge}`} style={{ fontSize: 12 }}>
                                {statusLabel}
                              </span>
                            </td>
                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                              {app.managerNote || app.cancelReason || '-'}
                            </td>
                            <td>
                              {canCancel ? (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleCancel(app.id)}
                                  title="Batalkan pendaftaran ini (kuota dikembalikan)"
                                >
                                  <MdCancel style={{ marginRight: 4 }} /> Batalkan
                                </button>
                              ) : (
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>-</span>
                              )}
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
        </div>
      </div>

      {/* MODAL FORMULIR PENDAFTARAN UKM */}
      {selectedUkm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedUkm(null)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>Formulir Pendaftaran {selectedUkm.name}</h3>
              <button className="modal-close" onClick={() => setSelectedUkm(null)}>
                <MdClose />
              </button>
            </div>

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '12px 14px',
                  borderRadius: 12,
                  fontSize: 13,
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedUkm.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                  NIM: <strong>{user?.nim}</strong> · {user?.name} ({user?.prodi})
                </div>
              </div>

              <div className="form-group">
                <label>Motivasi & Alasan Ingin Bergabung</label>
                <textarea
                  className="input"
                  rows={4}
                  required
                  placeholder="Ceritakan minat Anda, kemampuan yang ingin dikembangkan, atau kontribusi yang ingin diberikan pada UKM ini..."
                  value={motivation}
                  onChange={e => setMotivation(e.target.value)}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Motivasi ini akan ditinjau langsung oleh Pengelola UKM {selectedUkm.name}.
                </span>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <MdInfo style={{ color: 'var(--primary)', fontSize: 16 }} />
                <span>Kuota maksimal Anda adalah 2 UKM aktif.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setSelectedUkm(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UPLOAD / PERBARUI FOTO KTM (FR-AKN-04) */}
      {ktmModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setKtmModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3>Unggah Foto KTM untuk Verifikasi</h3>
              <button className="modal-close" onClick={() => setKtmModal(false)}>
                <MdClose />
              </button>
            </div>

            <form onSubmit={submitKtm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Sesuai aturan PRD (FR-AKN-04 & FR-AKN-06), foto Kartu Tanda Mahasiswa (KTM) digunakan untuk verifikasi identitas dan <strong>akan otomatis dihapus oleh sistem setelah disetujui</strong> demi menjaga privasi Anda.
              </p>

              <div className="form-group">
                {!ktmPreview ? (
                  <label
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 14,
                      padding: '24px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      background: 'var(--bg-subtle)',
                    }}
                  >
                    <MdUploadFile style={{ fontSize: 36, color: 'var(--primary)' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Pilih Foto KTM dari Galeri / Berkas
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Format JPG / PNG (Maks. 5MB)
                    </span>
                    <input type="file" accept="image/*" onChange={handleKtmChange} style={{ display: 'none' }} />
                  </label>
                ) : (
                  <div
                    style={{
                      position: 'relative',
                      border: '1px solid var(--border)',
                      borderRadius: 14,
                      overflow: 'hidden',
                      background: '#000',
                      maxHeight: 220,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img src={ktmPreview} alt="KTM Preview" style={{ width: '100%', maxHeight: 220, objectFit: 'contain' }} />
                    <button
                      type="button"
                      onClick={() => { setKtmFile(null); setKtmPreview(null); }}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <MdClose />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setKtmModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={!ktmFile || uploadingKtm}>
                  {uploadingKtm ? 'Mengunggah...' : 'Kirim Foto KTM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
