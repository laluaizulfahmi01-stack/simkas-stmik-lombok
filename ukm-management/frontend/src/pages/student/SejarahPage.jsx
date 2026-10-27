// src/pages/student/SejarahPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import ProPageHeader from '../../components/ProPageHeader';
import api from '../../api/axios';
import { MdSchool, MdHistoryEdu, MdVisibility, MdFlag, MdPerson, MdGroup, MdVerified, MdNorthEast } from 'react-icons/md';

export default function StudentSejarahPage() {
  const { user, activeUkmId, setActiveUkmId } = useAuth();
  const [ukm, setUkm] = useState(null);
  const [loading, setLoading] = useState(true);
  const ukms = user?.ukms || [];

  useEffect(() => {
    if (!activeUkmId && ukms.length > 0) {
      setActiveUkmId(ukms[0].id);
    }
  }, [activeUkmId, ukms, setActiveUkmId]);

  useEffect(() => {
    const idToUse = activeUkmId || ukms[0]?.id;
    if (!idToUse) return;
    setLoading(true);
    api.get('/ukm')
      .then(res => {
        const found = res.data.find(u => u.id === idToUse);
        setUkm(found || null);
      })
      .catch(() => setUkm(null))
      .finally(() => setLoading(false));
  }, [activeUkmId, ukms]);

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ProPageHeader
          title="Sejarah & Profil UKM"
          subtitle={`Mengenal identitas, jejak sejarah, visi & misi resmi ${ukm?.name || 'UKM STMIK Lombok'}`}
          pillBadge="Profil Resmi"
          pillColor="indigo"
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
          {loading ? (
            <div className="card empty-state">
              <div className="icon">⏳</div>
              <p>Memuat profil UKM...</p>
            </div>
          ) : !ukm ? (
            <div className="card empty-state">
              <div className="icon">🏛</div>
              <p>Data UKM belum tersedia</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Header Banner Card */}
              <div
                className="card"
                style={{
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(139,92,246,0.15) 100%)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  padding: 24,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <span className="badge badge-purple" style={{ marginBottom: 8 }}>
                      STMIK Lombok Official UKM
                    </span>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: '6px 0', color: 'var(--text-primary)' }}>
                      {ukm.name}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: 640, lineHeight: 1.6, fontSize: 14 }}>
                      {ukm.description || 'Unit Kegiatan Mahasiswa aktif di lingkungan kampus STMIK Lombok.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <div className="card" style={{ padding: '10px 16px', background: 'var(--bg-card)', minWidth: 140 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pembina / Pengelola</div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MdPerson style={{ color: 'var(--blue)' }} />
                        {ukm.manager?.name || 'Belum ditunjuk'}
                      </div>
                    </div>
                    <div className="card" style={{ padding: '10px 16px', background: 'var(--bg-card)', minWidth: 120 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Anggota</div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MdGroup style={{ color: 'var(--purple)' }} />
                        {ukm.members?.length || 0} Mahasiswa
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sejarah Section */}
              <div className="card">
                <div className="flex items-center" style={{ gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'rgba(59,130,246,0.15)',
                      color: 'var(--blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}
                  >
                    <MdHistoryEdu />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>Sejarah Singkat & Kilas Balik</h3>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Awal mula berdirinya organisasi di STMIK Lombok</div>
                  </div>
                </div>

                <div
                  style={{
                    lineHeight: 1.8,
                    fontSize: 14,
                    color: 'var(--text-primary)',
                    background: 'var(--bg-card-subtle, rgba(255,255,255,0.03))',
                    padding: 20,
                    borderRadius: 12,
                    borderLeft: '4px solid var(--blue)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {ukm.history || 'Sejarah organisasi ini sedang dalam proses penyusunan oleh pengelola UKM.'}
                </div>
              </div>

              {/* Visi & Misi Grid */}
              <div className="grid-2">
                {/* Visi */}
                <div className="card">
                  <div className="flex items-center" style={{ gap: 10, marginBottom: 14 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: 'rgba(139,92,246,0.15)',
                        color: 'var(--purple)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                      }}
                    >
                      <MdVisibility />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>Visi Organisasi</h3>
                  </div>
                  <div
                    style={{
                      lineHeight: 1.7,
                      fontSize: 14,
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      padding: 14,
                      background: 'rgba(139,92,246,0.05)',
                      borderRadius: 8,
                      border: '1px dashed rgba(139,92,246,0.25)',
                    }}
                  >
                    "{ukm.vision || 'Menjadi wadah pembinaan mahasiswa STMIK Lombok yang berintegritas dan unggul.'}"
                  </div>
                </div>

                {/* Misi */}
                <div className="card">
                  <div className="flex items-center" style={{ gap: 10, marginBottom: 14 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: 'rgba(34,197,94,0.15)',
                        color: 'var(--green)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                      }}
                    >
                      <MdFlag />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>Misi Utama</h3>
                  </div>
                  <div
                    style={{
                      lineHeight: 1.7,
                      fontSize: 14,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {ukm.mission || '1. Mengembangkan potensi setiap anggota.\n2. Melaksanakan program kerja bermanfaat.'}
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
