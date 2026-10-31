// src/pages/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ThemeToggle from '../components/ThemeToggle';
import {
  FiHash, FiUser, FiBookOpen, FiLock, FiUploadCloud,
  FiCheckCircle, FiInfo, FiX, FiArrowUpRight, FiZap, FiArrowRight,
  FiAward, FiStar, FiClock
} from 'react-icons/fi';

import SimkasLoader from '../components/SimkasLoader';

const PRODI = ['Teknik Informatika', 'Sistem Informasi'];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const preselectedUkmId = searchParams.get('ukm');

  const [form, setForm] = useState({ nim: '', name: '', prodi: '', password: '' });
  const [ukmList, setUkmList] = useState([]);
  const [selectedUkmId, setSelectedUkmId] = useState(preselectedUkmId || '');
  const [motivation, setMotivation] = useState('');
  const [ktmFile, setKtmFile] = useState(null);
  const [ktmPreview, setKtmPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaderState, setLoaderState] = useState({
    active: false,
    title: 'Pendaftaran Akun SIMKAS',
    subtitle: 'Memproses data pendaftaran...',
    progress: 35,
    isExiting: false,
  });

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/ukm')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setUkmList(res.data);
          if (!selectedUkmId && !preselectedUkmId) {
            setSelectedUkmId(String(res.data[0].id));
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (preselectedUkmId) {
      setSelectedUkmId(preselectedUkmId);
    }
  }, [preselectedUkmId]);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleKtmChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return toast('Ukuran foto maksimal 5 MB', 'error');
    }
    const reader = new FileReader();
    reader.onload = ev => {
      setKtmPreview(ev.target.result);
      setKtmFile(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeKtm = () => {
    setKtmFile(null);
    setKtmPreview(null);
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setLoaderState({
      active: true,
      title: 'SIMKAS STMIK Lombok',
      subtitle: 'Memproses Berkas & Pengajuan Pendaftaran UKM...',
      progress: 40,
      isExiting: false,
    });
    try {
      const payload = {
        ...form,
        ktmDocument: ktmFile || null,
        ukmId: selectedUkmId ? Number(selectedUkmId) : null,
        motivation: motivation ? motivation.trim() : null,
      };
      const res = await api.post('/auth/register', payload);

      if (res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        setLoaderState({
          active: true,
          title: 'Pendaftaran Berhasil!',
          subtitle: 'Mengarahkan ke Status Menunggu Persetujuan Pengelola UKM...',
          progress: 100,
          isExiting: false,
        });
        await new Promise(r => setTimeout(r, 450));
        setLoaderState(prev => ({ ...prev, isExiting: true }));
        toast(res.data.message || 'Pendaftaran berhasil diajukan!', 'success');
        setTimeout(() => {
          navigate('/student');
        }, 250);
      } else {
        setLoaderState({
          active: true,
          title: 'Pendaftaran Berhasil!',
          subtitle: 'Mengarahkan ke Halaman Masuk...',
          progress: 100,
          isExiting: false,
        });
        await new Promise(r => setTimeout(r, 450));
        setLoaderState(prev => ({ ...prev, isExiting: true }));
        toast(res.data.message || 'Pendaftaran akun berhasil!', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 250);
      }
    } catch (err) {
      setLoaderState({ active: false, isExiting: false });
      setLoading(false);

      // Jika NIM sudah terdaftar (HTTP 409 Conflict):
      if (err.response?.status === 409 || err.response?.data?.message?.includes('NIM sudah terdaftar')) {
        try {
          // Upayakan auto-login langsung dengan kata sandi yang diinputkan pengguna
          const loginRes = await api.post('/auth/login', {
            nim: form.nim,
            password: form.password,
          });
          if (loginRes.data.token && loginRes.data.user) {
            login(loginRes.data.token, loginRes.data.user);
            toast('NIM sudah terdaftar sebelumnya. Berhasil diarahkan masuk ke akun Anda!', 'success');
            navigate('/student');
            return;
          }
        } catch {
          // Jika kata sandi berbeda, arahkan langsung ke halaman login dengan NIM terisi otomatis
          toast('NIM ini sudah terdaftar di SIMKAS. Mengarahkan ke halaman masuk...', 'info');
          setTimeout(() => {
            navigate(`/login?nim=${encodeURIComponent(form.nim)}`);
          }, 800);
          return;
        }
      }

      toast(err.response?.data?.message || 'Pendaftaran gagal', 'error');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e8edf2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {loaderState.active && (
        <SimkasLoader
          fullScreen={true}
          title={loaderState.title}
          subtitle={loaderState.subtitle}
          progress={loaderState.progress}
          isExiting={loaderState.isExiting}
          badge="Pendaftaran Mahasiswa STMIK Lombok"
        />
      )}
      {/* Floating Theme Toggle */}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 100 }}>
        <ThemeToggle variant="icon" />
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 500,
          background: '#ffffff',
          borderRadius: 28,
          padding: '36px 32px',
          boxShadow: '0 20px 45px -12px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              overflow: 'hidden',
              margin: '0 auto 12px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/simkas-logo.png"
              alt="Logo Resmi SIMKAS"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scale(1.42)',
              }}
            />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f5f9', padding: '4px 12px', borderRadius: 999, marginBottom: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4ff00' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#09090b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              REGISTRASI MAHASISWA
            </span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 900, margin: '4px 0 6px', color: '#09090b', letterSpacing: -0.5 }}>
            Buat Akun SIMKAS
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Daftarkan akun kampus Anda untuk verifikasi & pendaftaran UKM
          </p>
        </div>

        {/* Step Guide Pill */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: 16,
            padding: '12px 16px',
            marginBottom: 20,
            border: '1px solid #e2e8f0',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#ecfccb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f6212', flexShrink: 0 }}>
            <FiInfo style={{ fontSize: 16 }} />
          </div>
          <div style={{ color: '#475569', lineHeight: 1.4 }}>
            <strong>Alur Bergabung UKM:</strong> Buat Akun &rarr; Verifikasi KTM &rarr; Pilih & Daftar UKM Kampus.
          </div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#09090b', marginBottom: 6 }}>
                NIM Mahasiswa
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="nim"
                  placeholder="Contoh: 220101005"
                  value={form.nim}
                  onChange={handle}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 36px',
                    borderRadius: 14,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#09090b',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <FiHash style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#09090b', marginBottom: 6 }}>
                Nama Lengkap
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="name"
                  placeholder="Nama sesuai KTM"
                  value={form.name}
                  onChange={handle}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 36px',
                    borderRadius: 14,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#09090b',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <FiUser style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15 }} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#09090b', marginBottom: 6 }}>
              Program Studi
            </label>
            <div style={{ position: 'relative' }}>
              <select
                name="prodi"
                value={form.prodi}
                onChange={handle}
                required
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 36px',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#09090b',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Pilih Program Studi</option>
                {PRODI.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <FiBookOpen style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#09090b', marginBottom: 6 }}>
              Kata Sandi Akun
            </label>
            <div style={{ position: 'relative' }}>
              <input
                name="password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={handle}
                required
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 36px',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#09090b',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15 }} />
            </div>
          </div>

          {/* UKM Destination Selection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#09090b' }}>
                Pilih UKM Tujuan (Pendaftaran Awal)
              </label>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 999 }}>
                Langsung Terkirim
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginBottom: 8 }}>
              {ukmList.map(u => {
                const isSelected = String(selectedUkmId) === String(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUkmId(String(u.id))}
                    style={{
                      border: isSelected ? '2px solid #09090b' : '1px solid #e2e8f0',
                      background: isSelected ? '#f8fafc' : '#ffffff',
                      borderRadius: 14,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#09090b' }}>{u.name}</span>
                      {isSelected ? (
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#09090b', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          ✓
                        </span>
                      ) : (
                        <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid #cbd5e1' }} />
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginTop: 2 }}>
                      {u.tag || 'UKM Resmi Kampus'}
                    </span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
              *Pengajuan ini akan langsung ditinjau oleh Pengelola UKM yang Anda pilih.
            </p>
          </div>

          {/* Motivation / Reason */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#09090b', marginBottom: 6 }}>
              Motivasi & Alasan Ingin Bergabung
            </label>
            <textarea
              name="motivation"
              rows={2}
              placeholder="Ceritakan minat dan alasan Anda mendaftar pada UKM tersebut..."
              value={motivation}
              onChange={e => setMotivation(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: 13,
                fontWeight: 500,
                color: '#09090b',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Upload KTM */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#09090b' }}>
                Foto KTM (Kartu Tanda Mahasiswa)
              </label>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Opsional</span>
            </div>

            {!ktmPreview ? (
              <label
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: 16,
                  padding: '18px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  background: '#f8fafc',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 12, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#09090b', border: '1px solid #e2e8f0' }}>
                  <FiUploadCloud style={{ fontSize: 20 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>
                  Pilih atau Tarik Foto KTM di Sini
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  Format JPG / PNG (Maksimal 5MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleKtmChange}
                  style={{ display: 'none' }}
                />
              </label>
            ) : (
              <div
                style={{
                  position: 'relative',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: '#09090b',
                  maxHeight: 180,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={ktmPreview}
                  alt="Preview KTM"
                  style={{ width: '100%', maxHeight: 180, objectFit: 'contain' }}
                />
                <button
                  type="button"
                  onClick={removeKtm}
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
                  title="Hapus foto"
                >
                  <FiX />
                </button>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    background: '#d4ff00',
                    color: '#09090b',
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <FiCheckCircle /> Foto Terpilih
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 999,
              border: 'none',
              background: '#09090b',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? 'Memproses Pendaftaran...' : (
              <>
                <span>Daftar & Ajukan ke Pengelola UKM</span>
                <FiArrowUpRight style={{ fontSize: 16 }} />
              </>
            )}
          </button>
          <p style={{ fontSize: 11, color: '#64748b', textAlign: 'center', margin: '4px 0 0' }}>
            Setelah mendaftar, Anda langsung masuk ke halaman pemantauan status persetujuan pengelola UKM.
          </p>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Sudah memiliki akun?{' '}
            <Link to="/login" style={{ color: '#09090b', fontWeight: 800, textDecoration: 'none' }}>
              Masuk ke Sistem &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
