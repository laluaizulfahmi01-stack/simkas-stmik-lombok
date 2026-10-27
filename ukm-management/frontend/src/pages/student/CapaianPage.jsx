// src/pages/student/CapaianPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import ProPageHeader from '../../components/ProPageHeader';
import api from '../../api/axios';
import {
  MdWorkspacePremium, MdAutoStories, MdPhotoCamera, MdDownload,
  MdClose, MdVisibility, MdCalendarToday, MdPerson
} from 'react-icons/md';

export default function StudentCapaianPage() {
  const { user, activeUkmId, setActiveUkmId } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [activeModalItem, setActiveModalItem] = useState(null);

  const ukms = user?.ukms || [];
  const activeUkm = ukms.find(u => u.id === activeUkmId) || ukms[0];

  useEffect(() => {
    if (!activeUkmId && ukms.length > 0) {
      setActiveUkmId(ukms[0].id);
    }
  }, [activeUkmId, ukms, setActiveUkmId]);

  useEffect(() => {
    const idToUse = activeUkmId || ukms[0]?.id;
    if (!idToUse) return;
    setLoading(true);
    api.get(`/ukm/${idToUse}/achievements`)
      .then(r => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeUkmId, ukms]);

  const filtered = category === 'all' ? items : items.filter(x => x.category === category);

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ProPageHeader
          title="Capaian, Prestasi & E-Book"
          subtitle={`Koleksi arsip karya, prestasi & modul bacaan digital resmi ${activeUkm?.name || 'UKM STMIK Lombok'}`}
          pillBadge="Koleksi Digital"
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
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', overflowX: 'auto' }}>
            {[
              { id: 'all', label: '🌟 Semua Koleksi' },
              { id: 'capaian', label: '🏆 Capaian & Prestasi' },
              { id: 'ebook', label: '📖 E-Book & Modul Bacaan' },
              { id: 'foto_kegiatan', label: '📷 Foto Dokumentasi' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`btn ${category === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 12, padding: '8px 18px', fontSize: 13, fontWeight: 600 }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="icon">⏳</div>
              <p>Memuat koleksi...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card empty-state">
              <div className="icon">📂</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Belum Ada Data dalam Kategori Ini
              </h3>
              <p style={{ marginTop: 6 }}>
                Pengelola {activeUkm?.name} belum mengunggah data capaian atau e-book baru.
              </p>
            </div>
          ) : (
            <div className="grid-3" style={{ gap: 20 }}>
              {filtered.map(item => (
                <div key={item.id} className="resource-card">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="resource-cover"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveModalItem(item)}
                    />
                  ) : (
                    <div
                      style={{
                        height: 180,
                        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 48,
                      }}
                    >
                      {item.category === 'ebook' ? '📖' : item.category === 'capaian' ? '🏆' : '📷'}
                    </div>
                  )}

                  <div className="resource-body">
                    <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
                      <span className={`badge ${item.category === 'ebook' ? 'badge-blue' : item.category === 'capaian' ? 'badge-yellow' : 'badge-purple'}`}>
                        {item.category === 'ebook' ? '📖 E-Book' : item.category === 'capaian' ? '🏆 Prestasi' : '📷 Foto'}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MdCalendarToday /> {item.year}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: 16 }}>
                      {item.description}
                    </p>

                    {item.author && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
                        <MdPerson /> {item.author}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <button
                        className="btn btn-primary btn-sm w-full"
                        style={{ justifyContent: 'center' }}
                        onClick={() => setActiveModalItem(item)}
                      >
                        <MdVisibility /> {item.category === 'ebook' ? 'Baca E-Book' : 'Lihat Detail'}
                      </button>

                      {item.fileUrl && (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost btn-sm"
                          title="Unduh E-Book"
                          style={{ padding: '0 12px' }}
                        >
                          <MdDownload />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail / E-Book Reader Modal */}
      {activeModalItem && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActiveModalItem(null)}>
          <div className="modal" style={{ maxWidth: 650 }}>
            <div className="modal-header">
              <div>
                <span className={`badge ${activeModalItem.category === 'ebook' ? 'badge-blue' : activeModalItem.category === 'capaian' ? 'badge-yellow' : 'badge-purple'}`} style={{ marginBottom: 6 }}>
                  {activeModalItem.category === 'ebook' ? '📖 Modul / E-Book Digital' : activeModalItem.category === 'capaian' ? '🏆 Prestasi & Capaian' : '📷 Foto Dokumentasi'}
                </span>
                <h3>{activeModalItem.title}</h3>
              </div>
              <button className="modal-close" onClick={() => setActiveModalItem(null)}>
                <MdClose />
              </button>
            </div>

            {activeModalItem.imageUrl && (
              <div style={{ marginBottom: 18, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img
                  src={activeModalItem.imageUrl}
                  alt={activeModalItem.title}
                  style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>📅 Tahun: <strong>{activeModalItem.year}</strong></span>
              {activeModalItem.author && <span>✍️ Oleh: <strong>{activeModalItem.author}</strong></span>}
              {activeModalItem.fileSize && <span>📦 Ukuran: <strong>{activeModalItem.fileSize}</strong></span>}
            </div>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: 'var(--text-primary)',
                background: '#f8fafc',
                padding: 16,
                borderRadius: 12,
                border: '1px solid var(--border)',
                marginBottom: 20,
                whiteSpace: 'pre-line',
              }}
            >
              {activeModalItem.description}
            </div>

            {activeModalItem.category === 'ebook' && (
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px dashed #93c5fd',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1d4ed8' }}>
                    Dokumen & E-Book Siap Dibaca
                  </div>
                  <div style={{ fontSize: 12, color: '#3b82f6' }}>
                    Format PDF dapat dibaca langsung atau diunduh ke perangkat kamu.
                  </div>
                </div>

                <a
                  href={activeModalItem.fileUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <MdDownload /> Buka / Unduh
                </a>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setActiveModalItem(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
