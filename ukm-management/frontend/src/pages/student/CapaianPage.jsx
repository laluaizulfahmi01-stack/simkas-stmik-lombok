// src/pages/student/CapaianPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import ProPageHeader from '../../components/ProPageHeader';
import EbookReader from '../../components/EbookReader';
import api from '../../api/axios';
import {
  MdWorkspacePremium, MdAutoStories, MdPhotoCamera, MdDownload,
  MdClose, MdVisibility, MdCalendarToday, MdPerson, MdFullscreen,
  MdMenuBook, MdSearch, MdArrowForward, MdInfoOutline
} from 'react-icons/md';

export default function StudentCapaianPage() {
  const { user, activeUkmId, setActiveUkmId } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [readingEbook, setReadingEbook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      .then(r => setItems(r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeUkmId, ukms]);

  // Filter items by category & search query
  const filtered = items.filter(item => {
    const matchesCategory = category === 'all' || item.category === category;
    const matchesSearch = !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const ebooks = filtered.filter(x => x.category === 'ebook');
  const capaian = filtered.filter(x => x.category === 'capaian');
  const photos = filtered.filter(x => x.category === 'foto_kegiatan' || x.category === 'foto');

  const openItemDetail = (item) => {
    if (item.category === 'ebook') {
      setReadingEbook(item);
    } else {
      setActiveModalItem(item);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ProPageHeader
          title="Capaian, Prestasi & Perpustakaan E-Book"
          subtitle={`Koleksi arsip karya, prestasi & modul bacaan digital resmi ${activeUkm?.name || 'UKM STMIK Lombok'}`}
          pillBadge="Koleksi Digital"
          pillColor="indigo"
          subbar={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', width: '100%' }}>
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

              {/* Quick Search */}
              <div style={{ position: 'relative', minWidth: 220, maxWidth: 300, flex: 1 }}>
                <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 18 }} />
                <input
                  type="text"
                  placeholder="Cari e-book, materi, prestasi..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 14px 8px 36px',
                    borderRadius: 999,
                    border: '1px solid var(--border)',
                    background: '#f8fafc',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          }
        />

        <div className="main-content">
          {/* Navigation Filter Tabs */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'all', label: '🌟 Semua Koleksi', count: items.length },
              { id: 'ebook', label: '📖 Perpustakaan E-Book & Modul', count: items.filter(x => x.category === 'ebook').length },
              { id: 'capaian', label: '🏆 Capaian & Prestasi', count: items.filter(x => x.category === 'capaian').length },
              { id: 'foto_kegiatan', label: '📷 Foto Dokumentasi', count: items.filter(x => x.category === 'foto_kegiatan' || x.category === 'foto').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`btn ${category === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  borderRadius: 12,
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    background: category === tab.id ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="icon">⏳</div>
              <p>Memuat koleksi digital {activeUkm?.name}...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card empty-state" style={{ padding: 48, textAlign: 'center' }}>
              <div className="icon" style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                Belum Ada Data dalam Kategori Ini
              </h3>
              <p style={{ marginTop: 6, color: 'var(--text-secondary)', maxWidth: 460, margin: '6px auto 0' }}>
                Pengelola {activeUkm?.name} belum mengunggah dokumen atau modul untuk kategori ini.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

              {/* ════════════════════════════════════════════════════════════════════
                  SECTION 1: PERPUSTAKAAN E-BOOK (DIPISAH SENDIRI, TIDAK TERCAMPUR)
                  ════════════════════════════════════════════════════════════════════ */}
              {(category === 'all' || category === 'ebook') && ebooks.length > 0 && (
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>📖</span>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          Perpustakaan E-Book & Modul Bacaan Digital
                        </h2>
                        <span className="badge badge-blue" style={{ fontSize: 11, fontWeight: 700 }}>
                          {ebooks.length} E-Book Siap Baca
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 28px' }}>
                        Disediakan khusus untuk mahasiswa {activeUkm?.name}. Baca langsung 1 layar penuh tanpa distraksi.
                      </p>
                    </div>

                    {category === 'all' && (
                      <button
                        onClick={() => setCategory('ebook')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary)',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        Lihat Semua E-Book <MdArrowForward />
                      </button>
                    )}
                  </div>

                  {/* E-Book Dedicated Shelf Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: 20,
                    }}
                  >
                    {ebooks.map(item => (
                      <div
                        key={item.id}
                        className="card"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 18,
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                          overflow: 'hidden',
                          background: '#ffffff',
                          transition: 'all 0.25s ease',
                        }}
                      >
                        {/* Book Header / Preview Area */}
                        <div
                          style={{
                            position: 'relative',
                            height: 190,
                            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                            overflow: 'hidden',
                            cursor: 'pointer',
                          }}
                          onClick={() => setReadingEbook(item)}
                          title="Klik untuk membuka mode baca 1 layar"
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.85,
                                transition: 'transform 0.3s ease',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 54,
                                color: '#93c5fd',
                              }}
                            >
                              📖
                            </div>
                          )}

                          {/* Overlay Pill Badge */}
                          <div
                            style={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              background: 'rgba(15, 23, 42, 0.8)',
                              backdropFilter: 'blur(8px)',
                              color: '#60a5fa',
                              padding: '4px 10px',
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              border: '1px solid rgba(255,255,255,0.15)',
                            }}
                          >
                            <MdMenuBook /> E-Book Resmi
                          </div>

                          {/* Fullscreen Reading Floating Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReadingEbook(item);
                            }}
                            style={{
                              position: 'absolute',
                              bottom: 12,
                              right: 12,
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
                            }}
                          >
                            <MdFullscreen style={{ fontSize: 16 }} /> Baca 1 Layar
                          </button>
                        </div>

                        {/* Book Meta & Description */}
                        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MdCalendarToday /> Tahun {item.year}
                            </span>
                            {item.fileSize && (
                              <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontWeight: 700, color: '#475569' }}>
                                {item.fileSize}
                              </span>
                            )}
                          </div>

                          <h3
                            style={{
                              fontSize: 15.5,
                              fontWeight: 800,
                              color: 'var(--text-primary)',
                              lineHeight: 1.4,
                              marginBottom: 8,
                              cursor: 'pointer',
                            }}
                            onClick={() => setReadingEbook(item)}
                          >
                            {item.title}
                          </h3>

                          <p
                            style={{
                              fontSize: 13,
                              color: 'var(--text-secondary)',
                              lineHeight: 1.6,
                              flex: 1,
                              marginBottom: 16,
                            }}
                          >
                            {item.description}
                          </p>

                          {item.author && (
                            <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                              <MdPerson style={{ fontSize: 15, color: '#3b82f6' }} />
                              <span>Penyusun: <strong>{item.author}</strong></span>
                            </div>
                          )}

                          {/* Action Buttons: 1-Layar Baca Fullscreen + Download */}
                          <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                            <button
                              onClick={() => setReadingEbook(item)}
                              className="btn btn-primary btn-sm"
                              style={{
                                flex: 1,
                                justifyContent: 'center',
                                borderRadius: 12,
                                padding: '9px 16px',
                                fontWeight: 700,
                                background: '#2563eb',
                                borderColor: '#2563eb',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              <MdMenuBook style={{ fontSize: 16 }} />
                              <span>Baca E-Book (1 Layar)</span>
                            </button>

                            {item.fileUrl && (
                              <a
                                href={item.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-ghost btn-sm"
                                style={{
                                  borderRadius: 12,
                                  padding: '0 14px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid var(--border)',
                                }}
                                title="Unduh salinan berkas PDF"
                              >
                                <MdDownload style={{ fontSize: 18 }} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ════════════════════════════════════════════════════════════════════
                  SECTION 2: PRESTASI & CAPAIAN (DIPISAH SENDIRI)
                  ════════════════════════════════════════════════════════════════════ */}
              {(category === 'all' || category === 'capaian') && capaian.length > 0 && (
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>🏆</span>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          Capaian & Prestasi Unggulan Mahasiswa
                        </h2>
                        <span className="badge badge-yellow" style={{ fontSize: 11, fontWeight: 700 }}>
                          {capaian.length} Prestasi Terdata
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 28px' }}>
                        Rekam jejak medali, penghargaan, dan inovasi yang dipersembahkan anggota {activeUkm?.name}.
                      </p>
                    </div>

                    {category === 'all' && (
                      <button
                        onClick={() => setCategory('capaian')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#d97706',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        Lihat Semua Prestasi <MdArrowForward />
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: 20,
                    }}
                  >
                    {capaian.map(item => (
                      <div
                        key={item.id}
                        className="card"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 18,
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                          overflow: 'hidden',
                          background: '#ffffff',
                          transition: 'all 0.25s ease',
                        }}
                      >
                        {item.imageUrl ? (
                          <div style={{ height: 180, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setActiveModalItem(item)}>
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <div style={{ height: 140, background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                            🏆
                          </div>
                        )}

                        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span className="badge badge-yellow" style={{ fontSize: 11, fontWeight: 700 }}>
                              🏆 Prestasi
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

                          <button
                            className="btn btn-ghost btn-sm w-full"
                            style={{ justifyContent: 'center', borderRadius: 10, border: '1px solid var(--border)', fontWeight: 600 }}
                            onClick={() => setActiveModalItem(item)}
                          >
                            <MdVisibility /> Lihat Detail Prestasi
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ════════════════════════════════════════════════════════════════════
                  SECTION 3: FOTO DOKUMENTASI & GALERI (DIPISAH SENDIRI)
                  ════════════════════════════════════════════════════════════════════ */}
              {(category === 'all' || category === 'foto_kegiatan') && photos.length > 0 && (
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>📷</span>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          Foto Dokumentasi & Galeri Kegiatan
                        </h2>
                        <span className="badge badge-purple" style={{ fontSize: 11, fontWeight: 700 }}>
                          {photos.length} Album Dokumentasi
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 28px' }}>
                        Momen kebersamaan, diklat lapangan, workshop, dan agenda resmi {activeUkm?.name}.
                      </p>
                    </div>

                    {category === 'all' && (
                      <button
                        onClick={() => setCategory('foto_kegiatan')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#7c3aed',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        Lihat Semua Dokumentasi <MdArrowForward />
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: 20,
                    }}
                  >
                    {photos.map(item => (
                      <div
                        key={item.id}
                        className="card"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 18,
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                          overflow: 'hidden',
                          background: '#ffffff',
                          transition: 'all 0.25s ease',
                        }}
                      >
                        {item.imageUrl ? (
                          <div style={{ height: 180, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setActiveModalItem(item)}>
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <div style={{ height: 140, background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                            📷
                          </div>
                        )}

                        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span className="badge badge-purple" style={{ fontSize: 11, fontWeight: 700 }}>
                              📷 Dokumentasi
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

                          <button
                            className="btn btn-ghost btn-sm w-full"
                            style={{ justifyContent: 'center', borderRadius: 10, border: '1px solid var(--border)', fontWeight: 600 }}
                            onClick={() => setActiveModalItem(item)}
                          >
                            <MdVisibility /> Lihat Foto Penuh
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          IMMERSIVE 1-LAYAR FULLSCREEN E-BOOK READER
          ════════════════════════════════════════════════════════════════════ */}
      <EbookReader
        isOpen={!!readingEbook}
        onClose={() => setReadingEbook(null)}
        ebook={readingEbook}
        ukmName={activeUkm?.name}
      />

      {/* ════════════════════════════════════════════════════════════════════
          REGULAR DETAIL MODAL (FOR PRESTASI & FOTO DOKUMENTASI)
          ════════════════════════════════════════════════════════════════════ */}
      {activeModalItem && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActiveModalItem(null)}>
          <div className="modal" style={{ maxWidth: 650, borderRadius: 20 }}>
            <div className="modal-header">
              <div>
                <span
                  className={`badge ${activeModalItem.category === 'ebook' ? 'badge-blue' : activeModalItem.category === 'capaian' ? 'badge-yellow' : 'badge-purple'}`}
                  style={{ marginBottom: 6 }}
                >
                  {activeModalItem.category === 'ebook' ? '📖 Modul / E-Book Digital' : activeModalItem.category === 'capaian' ? '🏆 Prestasi & Capaian' : '📷 Foto Dokumentasi'}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>{activeModalItem.title}</h3>
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
                  style={{ width: '100%', maxHeight: 380, objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>📅 Tahun: <strong>{activeModalItem.year}</strong></span>
              {activeModalItem.author && <span>✍️ Oleh: <strong>{activeModalItem.author}</strong></span>}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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