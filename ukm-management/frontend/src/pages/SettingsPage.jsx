// src/pages/SettingsPage.jsx - Comprehensive Profile, Avatar, Verification & Security Settings
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import Sidebar from '../components/Sidebar';
import ProPageHeader from '../components/ProPageHeader';
import api from '../api/axios';
import {
  MdPerson, MdSecurity, MdVerified, MdTune, MdCameraAlt,
  MdCheckCircle, MdCancel, MdHourglassTop, MdCloudUpload,
  MdDelete, MdSave, MdLock, MdVisibility, MdVisibilityOff,
  MdBadge, MdPhone, MdEmail, MdSchool, MdLightMode, MdDarkMode
} from 'react-icons/md';

const PRODI_LIST = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Komputerisasi Akuntansi',
  'Manajemen Informatika',
  'Administrasi Kampus'
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    prodi: user?.prodi || '',
    avatar: user?.avatar || null,
  });

  // Verification Form State
  const [verifyDoc, setVerifyDoc] = useState(null);
  const [verifyDocPreview, setVerifyDocPreview] = useState(null);
  const [verifyNote, setVerifyNote] = useState('');
  const [verificationsList, setVerificationsList] = useState([]);
  const [loadingVerifications, setLoadingVerifications] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Sync user changes from AuthContext
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        prodi: user.prodi || '',
        avatar: user.avatar || null,
      }));
    }
  }, [user]);

  // Load pending verifications for Super Admin
  useEffect(() => {
    if (user?.role === 'superadmin' && activeTab === 'verification') {
      loadVerifications();
    }
  }, [user, activeTab]);

  const loadVerifications = async () => {
    setLoadingVerifications(true);
    try {
      const res = await api.get('/admin/verifications');
      setVerificationsList(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVerifications(false);
    }
  };

  // Avatar Image Upload Handler (convert to base64 with size check)
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast('Harap pilih berkas gambar yang valid (JPG/PNG)', 'error');
    }
    if (file.size > 2 * 1024 * 1024) {
      return toast('Ukuran foto maksimal 2 MB', 'error');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setProfileForm(prev => ({ ...prev, avatar: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // Remove Avatar
  const handleRemoveAvatar = () => {
    setProfileForm(prev => ({ ...prev, avatar: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Update basic profile info
      const res = await api.put('/profile', {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        bio: profileForm.bio,
        prodi: profileForm.prodi,
      });

      // 2. Update avatar if changed
      if (profileForm.avatar !== user?.avatar) {
        await api.put('/profile/avatar', { avatar: profileForm.avatar });
      }

      updateUser({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        bio: profileForm.bio,
        prodi: profileForm.prodi,
        avatar: profileForm.avatar,
      });

      toast('Profil dan foto berhasil diperbarui! 🎉', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal menyimpan profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Verification Document Handler
  const handleDocChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      return toast('Ukuran dokumen maksimal 3 MB', 'error');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setVerifyDoc(event.target.result);
      setVerifyDocPreview(file.type.startsWith('image/') ? event.target.result : null);
    };
    reader.readAsDataURL(file);
  };

  // Submit Verification Request
  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!verifyDoc) {
      return toast('Lampirkan berkas bukti dokumen terlebih dahulu', 'error');
    }
    setLoading(true);
    try {
      const res = await api.post('/profile/verify', {
        document: verifyDoc,
        note: verifyNote,
      });
      updateUser({
        verificationStatus: 'pending',
        isVerified: false,
      });
      toast(res.data?.message || 'Permohonan verifikasi berhasil diajukan!', 'success');
      setVerifyDoc(null);
      setVerifyDocPreview(null);
      setVerifyNote('');
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal mengajukan verifikasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Super Admin: Approve Verification
  const handleApproveVerification = async (userId) => {
    try {
      const res = await api.put(`/admin/verifications/${userId}/approve`);
      toast(res.data?.message || 'Verifikasi berhasil disetujui', 'success');
      loadVerifications();
    } catch (err) {
      toast('Gagal menyetujui verifikasi', 'error');
    }
  };

  // Super Admin: Reject Verification
  const handleRejectVerification = async (userId) => {
    const reason = prompt('Masukkan alasan penolakan (opsional):');
    try {
      const res = await api.put(`/admin/verifications/${userId}/reject`, { reason });
      toast(res.data?.message || 'Verifikasi ditolak', 'info');
      loadVerifications();
    } catch (err) {
      toast('Gagal menolak verifikasi', 'error');
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast('Konfirmasi kata sandi baru tidak cocok', 'error');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast('Kata sandi baru minimal 6 karakter', 'error');
    }

    setLoading(true);
    try {
      const res = await api.put('/profile/password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast(res.data?.message || 'Kata sandi berhasil diperbarui!', 'success');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal mengubah kata sandi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel =
    user?.role === 'superadmin' ? 'Super Administrator' :
    user?.role === 'manager'    ? 'Pengelola UKM Kampus' : 'Mahasiswa STMIK Lombok';

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ProPageHeader
          title="Setelan Akun & Preferensi"
          subtitle={`Kelola profil pengguna, foto identitas, status verifikasi, dan keamanan akun ${roleLabel}`}
          pillBadge={user?.isVerified ? "Terverifikasi Resmi" : "Setelan Akun"}
          pillColor={user?.isVerified ? "lime" : "indigo"}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user?.isVerified ? (
                <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
                  <MdVerified style={{ fontSize: 17 }} /> Terverifikasi Resmi
                </span>
              ) : user?.verificationStatus === 'pending' ? (
                <span className="badge badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
                  <MdHourglassTop style={{ fontSize: 17 }} /> Menunggu Verifikasi
                </span>
              ) : (
                <span className="badge badge-gray" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
                  Belum Terverifikasi
                </span>
              )}
            </div>
          }
        />

        {/* Main Content */}
        <div className="main-content">
          {/* Settings Tabs Header */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              borderBottom: '1px solid var(--border)',
              paddingBottom: 12,
              marginBottom: 24,
              overflowX: 'auto',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`btn btn-sm ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 12, padding: '9px 18px', fontSize: 13 }}
            >
              <MdPerson style={{ fontSize: 18 }} /> Profil & Foto
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className={`btn btn-sm ${activeTab === 'verification' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 12, padding: '9px 18px', fontSize: 13 }}
            >
              <MdVerified style={{ fontSize: 18 }} /> Verifikasi Identitas
              {user?.verificationStatus === 'pending' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`btn btn-sm ${activeTab === 'security' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 12, padding: '9px 18px', fontSize: 13 }}
            >
              <MdSecurity style={{ fontSize: 18 }} /> Keamanan & Password
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`btn btn-sm ${activeTab === 'preferences' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 12, padding: '9px 18px', fontSize: 13 }}
            >
              <MdTune style={{ fontSize: 18 }} /> Preferensi & Tema
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════
              TAB 1: PROFIL & FOTO
              ══════════════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: 24, alignItems: 'start' }}>
              {/* Left Column: Avatar Card */}
              <div className="card" style={{ textAlign: 'center', padding: '30px 24px' }}>
                <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 18px' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: 'var(--grad-hero)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 38,
                      fontWeight: 800,
                      color: '#ffffff',
                      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                      border: '4px solid var(--bg-surface)',
                    }}
                  >
                    {profileForm.avatar ? (
                      <img
                        src={profileForm.avatar}
                        alt="Foto Profil"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  {/* Camera overlay upload trigger */}
                  <label
                    htmlFor="avatar-upload-input"
                    title="Unggah Foto Profil Baru"
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                      border: '2px solid var(--bg-surface)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <MdCameraAlt style={{ fontSize: 18 }} />
                  </label>
                  <input
                    id="avatar-upload-input"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {profileForm.name || user?.name}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, marginBottom: 8 }}>
                  {roleLabel}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Format JPG, PNG, atau WEBP. Maks 2 MB.
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <MdCloudUpload /> Pilih Foto
                  </button>
                  {profileForm.avatar && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={handleRemoveAvatar}
                      style={{ padding: '7px 10px' }}
                      title="Hapus Foto"
                    >
                      <MdDelete />
                    </button>
                  )}
                </div>

                {/* Identity summary */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'left', fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: 'var(--text-secondary)' }}>
                    <span>NIM / Identitas:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{user?.nim}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: 'var(--text-secondary)' }}>
                    <span>Status Akun:</span>
                    <strong style={{ color: user?.isVerified ? 'var(--green)' : '#f59e0b' }}>
                      {user?.isVerified ? 'Terverifikasi' : 'Reguler'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Right Column: Profile Form */}
              <div className="card">
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                    Informasi Profil & Data Diri
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Perbarui nama lengkap, kontak nomor WhatsApp, dan program studi kamu.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MdBadge style={{ color: 'var(--primary)' }} /> Nomor Induk Mahasiswa (NIM)
                      </label>
                      <input
                        className="input"
                        value={user?.nim || ''}
                        disabled
                        style={{ opacity: 0.75, cursor: 'not-allowed', background: 'var(--bg-subtle)' }}
                        title="NIM tidak dapat diubah secara mandiri untuk alasan keamanan akademik"
                      />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Identitas unik resmi terdaftar di STMIK Lombok
                      </span>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MdPerson style={{ color: 'var(--primary)' }} /> Nama Lengkap
                      </label>
                      <input
                        className="input"
                        value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                        placeholder="Nama lengkap kamu"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MdSchool style={{ color: 'var(--primary)' }} /> Program Studi
                      </label>
                      <select
                        className="input"
                        value={profileForm.prodi}
                        onChange={e => setProfileForm({ ...profileForm, prodi: e.target.value })}
                      >
                        <option value="">Pilih Program Studi</option>
                        {PRODI_LIST.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MdPhone style={{ color: 'var(--primary)' }} /> Nomor HP / WhatsApp
                      </label>
                      <input
                        className="input"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="Contoh: 08123456789"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdEmail style={{ color: 'var(--primary)' }} /> Alamat Email Resmi
                    </label>
                    <input
                      type="email"
                      className="input"
                      value={profileForm.email}
                      onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="nama@mhs.stmik-lombok.ac.id"
                    />
                  </div>

                  <div className="form-group">
                    <label>Bio & Minat Singkat</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={profileForm.bio}
                      onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Tuliskan minat bakat, keahlian, atau moto kamu di UKM..."
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontSize: 14 }}
                    >
                      <MdSave /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 2: VERIFIKASI IDENTITAS
              ══════════════════════════════════════════════════════════ */}
          {activeTab === 'verification' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Status Banner */}
              <div
                className="card"
                style={{
                  background: user?.isVerified
                    ? (isDark ? 'rgba(34, 197, 94, 0.12)' : '#f0fdf4')
                    : user?.verificationStatus === 'pending'
                    ? (isDark ? 'rgba(245, 158, 11, 0.12)' : '#fffbeb')
                    : (isDark ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff'),
                  borderColor: user?.isVerified ? 'var(--green)' : user?.verificationStatus === 'pending' ? 'var(--yellow)' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '24px 28px',
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 18,
                    background: user?.isVerified ? 'var(--green)' : user?.verificationStatus === 'pending' ? 'var(--yellow)' : 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    flexShrink: 0,
                  }}
                >
                  {user?.isVerified ? <MdVerified /> : user?.verificationStatus === 'pending' ? <MdHourglassTop /> : <MdBadge />}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {user?.isVerified
                      ? 'Akun Telah Terverifikasi Resmi'
                      : user?.verificationStatus === 'pending'
                      ? 'Permohonan Verifikasi Sedang Ditinjau'
                      : 'Akun Kamu Belum Terverifikasi'}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {user?.isVerified
                      ? 'Selamat! Akun Anda telah lolos verifikasi identitas resmi STMIK Lombok dan memiliki lencana tanda centang resmi.'
                      : user?.verificationStatus === 'pending'
                      ? 'Dokumen bukti identitas kamu telah terkirim dan sedang menunggu persetujuan Super Administrator.'
                      : 'Verifikasi akun kamu untuk mendapatkan centang resmi, akses penuh ke absensi khusus, hak suara UKM, dan sertifikat digital.'}
                  </p>
                </div>
              </div>

              {/* Form Pengajuan Verifikasi (Mahasiswa / Pengelola) */}
              {user?.role !== 'superadmin' && (
                <div className="card">
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                      {user?.role === 'manager' ? 'Pengajuan Verifikasi Pengelola UKM' : 'Pengajuan Verifikasi Mahasiswa'}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {user?.role === 'manager'
                        ? 'Unggah foto Surat Keputusan (SK) Pengurus UKM atau Surat Rekomendasi dari Pembina UKM.'
                        : 'Unggah foto Kartu Tanda Mahasiswa (KTM) asli atau screenshot KRS semester aktif.'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmitVerification} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div className="form-group">
                      <label>Unggah Dokumen Bukti (KTM / SK Kepengurusan)</label>
                      <div
                        onClick={() => docInputRef.current?.click()}
                        style={{
                          border: '2px dashed var(--border)',
                          borderRadius: 16,
                          padding: '30px 20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: 'var(--bg-subtle)',
                          transition: 'var(--transition)',
                        }}
                      >
                        {verifyDocPreview ? (
                          <div>
                            <img
                              src={verifyDocPreview}
                              alt="Bukti Dokumen"
                              style={{ maxWidth: 280, maxHeight: 180, borderRadius: 12, objectFit: 'contain', margin: '0 auto 12px' }}
                            />
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                              Dokumen siap diunggah (Klik untuk ganti)
                            </div>
                          </div>
                        ) : verifyDoc ? (
                          <div>
                            <MdCheckCircle style={{ fontSize: 40, color: 'var(--green)', marginBottom: 8 }} />
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Berkas Terpilih</div>
                          </div>
                        ) : (
                          <div>
                            <MdCloudUpload style={{ fontSize: 44, color: 'var(--primary)', marginBottom: 10 }} />
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                              Klik untuk memilih file KTM / SK Dokumen
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                              Mendukung format gambar JPG, PNG, atau PDF (Maks. 3 MB)
                            </div>
                          </div>
                        )}
                        <input
                          ref={docInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleDocChange}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Catatan Pengajuan Tambahan (Opsional)</label>
                      <input
                        className="input"
                        value={verifyNote}
                        onChange={e => setVerifyNote(e.target.value)}
                        placeholder="Contoh: Mahasiswa Aktif TI Angkatan 2022 / Pengurus Divisi IT Techcode"
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        disabled={loading || user?.verificationStatus === 'pending'}
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}
                      >
                        <MdVerified />
                        {user?.verificationStatus === 'pending'
                          ? 'Menunggu Peninjauan Admin'
                          : loading
                          ? 'Mengirimkan...'
                          : 'Kirim Permohonan Verifikasi'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Super Admin Review Panel */}
              {user?.role === 'superadmin' && (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                        Panel Peninjauan Verifikasi Pengguna
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        Daftar pengguna yang mengajukan verifikasi identitas (KTM / SK Kepengurusan).
                      </p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={loadVerifications}>
                      Muat Ulang
                    </button>
                  </div>

                  {loadingVerifications ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                      Memuat daftar verifikasi...
                    </div>
                  ) : verificationsList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      <MdCheckCircle style={{ fontSize: 44, color: 'var(--green)', marginBottom: 8 }} />
                      <div style={{ fontWeight: 700 }}>Tidak ada pengajuan verifikasi yang tertunda</div>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>NIM & Nama</th>
                            <th>Role & Prodi</th>
                            <th>Status Saat Ini</th>
                            <th>Bukti Dokumen</th>
                            <th>Aksi Administrator</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verificationsList.map(u => (
                            <tr key={u.id}>
                              <td>
                                <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{u.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>NIM: {u.nim}</div>
                              </td>
                              <td>
                                <div style={{ fontSize: 12, fontWeight: 600 }}>{u.prodi}</div>
                                <span className={`badge ${u.role === 'manager' ? 'badge-purple' : 'badge-blue'}`}>
                                  {u.role === 'manager' ? 'Pengelola' : 'Mahasiswa'}
                                </span>
                              </td>
                              <td>
                                {u.isVerified ? (
                                  <span className="badge badge-green">Terverifikasi</span>
                                ) : u.verificationStatus === 'pending' ? (
                                  <span className="badge badge-yellow">Menunggu</span>
                                ) : (
                                  <span className="badge badge-red">Ditolak</span>
                                )}
                              </td>
                              <td>
                                {u.verificationDocument ? (
                                  <a
                                    href={u.verificationDocument}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-ghost btn-sm"
                                    style={{ fontSize: 11, padding: '4px 10px' }}
                                  >
                                    Lihat Berkas
                                  </a>
                                ) : (
                                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tidak ada berkas</span>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  {!u.isVerified && (
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm"
                                      onClick={() => handleApproveVerification(u.id)}
                                      style={{ background: 'var(--green)', padding: '5px 10px', fontSize: 11 }}
                                    >
                                      Setujui
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRejectVerification(u.id)}
                                    style={{ padding: '5px 10px', fontSize: 11 }}
                                  >
                                    Tolak
                                  </button>
                                </div>
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
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 3: KEAMANAN & KATA SANDI
              ══════════════════════════════════════════════════════════ */}
          {activeTab === 'security' && (
            <div style={{ maxWidth: 640 }}>
              <div className="card">
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                    Perbarui Kata Sandi Akun
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Pastikan kata sandi kamu kuat dan mengandung kombinasi huruf, angka, dan simbol.
                  </p>
                </div>

                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdLock style={{ color: 'var(--primary)' }} /> Kata Sandi Saat Ini
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showOldPw ? 'text' : 'password'}
                        className="input"
                        value={passwordForm.oldPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        required
                        placeholder="Masukkan password akun kamu saat ini"
                        style={{ paddingRight: 40 }}
                      />
                      <span
                        onClick={() => setShowOldPw(!showOldPw)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}
                      >
                        {showOldPw ? <MdVisibilityOff /> : <MdVisibility />}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MdSecurity style={{ color: 'var(--primary)' }} /> Kata Sandi Baru
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        className="input"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        placeholder="Minimal 6 karakter"
                        style={{ paddingRight: 40 }}
                      />
                      <span
                        onClick={() => setShowNewPw(!showNewPw)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}
                      >
                        {showNewPw ? <MdVisibilityOff /> : <MdVisibility />}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Konfirmasi Kata Sandi Baru</label>
                    <input
                      type="password"
                      className="input"
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      placeholder="Ulangi kata sandi baru"
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px' }}
                    >
                      <MdLock /> {loading ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 4: PREFERENSI & TEMA
              ══════════════════════════════════════════════════════════ */}
          {activeTab === 'preferences' && (
            <div style={{ maxWidth: 680 }}>
              <div className="card">
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                    Tema Tampilan Antarmuka
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Pilih suasana warna tampilan yang paling nyaman untuk mata Anda saat menggunakan SIMKAS.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  {/* Light mode tile */}
                  <div
                    onClick={isDark ? toggleTheme : undefined}
                    style={{
                      border: !isDark ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 18,
                      padding: '20px 18px',
                      cursor: 'pointer',
                      background: !isDark ? 'var(--primary-light)' : 'var(--bg-subtle)',
                      transition: 'var(--transition)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 36, color: '#f59e0b', marginBottom: 8 }}>☀️</div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Mode Terang</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Tampilan cerah, bersih, dan kontras tinggi untuk siang hari
                    </div>
                    {!isDark && (
                      <span className="badge badge-blue" style={{ marginTop: 10 }}>Aktif</span>
                    )}
                  </div>

                  {/* Dark mode tile */}
                  <div
                    onClick={!isDark ? toggleTheme : undefined}
                    style={{
                      border: isDark ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 18,
                      padding: '20px 18px',
                      cursor: 'pointer',
                      background: isDark ? 'var(--primary-light)' : 'var(--bg-subtle)',
                      transition: 'var(--transition)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 36, color: '#818cf8', marginBottom: 8 }}>🌙</div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Mode Gelap (Slate)</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Tampilan slate lembut, tidak menyilaukan mata di malam hari
                    </div>
                    {isDark && (
                      <span className="badge badge-blue" style={{ marginTop: 10 }}>Aktif</span>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Informasi Sistem SIMKAS STMIK Lombok
                  </h4>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Versi Aplikasi: <strong>v2.2.0 (Build Motion & Theme Pro Max)</strong><br />
                    Keamanan: <strong>Enterprise Cyber Security Shield Aktif</strong> &bull; Enkripsi End-to-End JWT
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
