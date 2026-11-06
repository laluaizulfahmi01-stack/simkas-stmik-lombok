// src/components/EbookReader.jsx
// Immersive 1-Layar Fullscreen E-Book & Modul Reader for SIMKAS STMIK Lombok
import { useState, useEffect } from 'react';
import {
  MdArrowBack, MdFullscreen, MdFullscreenExit, MdDownload,
  MdZoomIn, MdZoomOut, MdAutoStories, MdMenuBook, MdClose,
  MdLightMode, MdDarkMode, MdShare, MdCheck
} from 'react-icons/md';

export default function EbookReader({ isOpen, onClose, ebook, ukmName = 'UKM STMIK Lombok' }) {
  const [readingTheme, setReadingTheme] = useState('sepia'); // 'light' | 'sepia' | 'dark'
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' | 'text'
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (!isOpen || !ebook) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Color schemes for reading comfort
  const themes = {
    light: {
      bg: '#ffffff',
      canvas: '#f8fafc',
      headerBg: '#ffffff',
      border: '#e2e8f0',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      accent: '#2563eb',
    },
    sepia: {
      bg: '#fbf0d9',
      canvas: '#f4e4c1',
      headerBg: '#f6ebd0',
      border: '#e6d3a7',
      textPrimary: '#3f2d19',
      textSecondary: '#6e5436',
      accent: '#9a3412',
    },
    dark: {
      bg: '#0f172a',
      canvas: '#090d16',
      headerBg: '#151d2e',
      border: '#1e293b',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      accent: '#60a5fa',
    },
  };

  const currentTheme = themes[readingTheme] || themes.sepia;

  // Fallback demo content if no PDF file exists
  const isPdf = ebook.fileUrl && ebook.fileUrl.endsWith('.pdf');
  const pdfUrl = ebook.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  return (
    <div
      className="simkas-ebook-fullscreen-reader"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: currentTheme.canvas,
        color: currentTheme.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      {/* ── TOP IMMERSIVE TOOLBAR ── */}
      <header
        style={{
          height: 64,
          background: currentTheme.headerBg,
          borderBottom: `1px solid ${currentTheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
          gap: 16,
          zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}
      >
        {/* Left: Back & Title info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <button
            onClick={onClose}
            className="reader-back-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: readingTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              border: `1px solid ${currentTheme.border}`,
              color: currentTheme.textPrimary,
              padding: '8px 16px',
              borderRadius: 999,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              transition: 'all 0.2s ease',
            }}
            title="Keluar dari mode baca 1 layar (Esc)"
          >
            <MdArrowBack style={{ fontSize: 18 }} />
            <span>Tutup & Kembali</span>
          </button>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: currentTheme.accent,
                  color: '#ffffff',
                  letterSpacing: 0.5,
                }}
              >
                E-Book Resmi
              </span>
              <span style={{ fontSize: 12, color: currentTheme.textSecondary, whiteSpace: 'nowrap' }}>
                {ukmName} • Tahun {ebook.year || '2026'}
              </span>
            </div>
            <h2
              style={{
                fontSize: 15,
                fontWeight: 800,
                margin: '2px 0 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 420,
              }}
              title={ebook.title}
            >
              {ebook.title}
            </h2>
          </div>
        </div>

        {/* Center: Mode Switch (PDF Dokumen vs Mode Teks) */}
        <div
          style={{
            display: 'flex',
            background: readingTheme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
            padding: 3,
            borderRadius: 12,
            border: `1px solid ${currentTheme.border}`,
          }}
          className="reader-mode-switch"
        >
          <button
            onClick={() => setViewMode('pdf')}
            style={{
              padding: '6px 14px',
              borderRadius: 9,
              border: 'none',
              background: viewMode === 'pdf' ? currentTheme.headerBg : 'transparent',
              color: viewMode === 'pdf' ? currentTheme.accent : currentTheme.textSecondary,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: viewMode === 'pdf' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <MdMenuBook style={{ fontSize: 16 }} />
            <span>Dokumen PDF</span>
          </button>

          <button
            onClick={() => setViewMode('text')}
            style={{
              padding: '6px 14px',
              borderRadius: 9,
              border: 'none',
              background: viewMode === 'text' ? currentTheme.headerBg : 'transparent',
              color: viewMode === 'text' ? currentTheme.accent : currentTheme.textSecondary,
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: viewMode === 'text' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <MdAutoStories style={{ fontSize: 16 }} />
            <span>Teks & Bab Materi</span>
          </button>
        </div>

        {/* Right Controls: Themes, Zoom, Fullscreen, Download */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Reading Comfort Theme Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: 999,
              padding: 3,
              background: readingTheme === 'dark' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.4)',
            }}
          >
            <button
              onClick={() => setReadingTheme('sepia')}
              title="Kenyamanan Mata (Sepia Paper)"
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#f4e4c1',
                border: readingTheme === 'sepia' ? '2px solid #9a3412' : '1px solid #d4c09b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 800,
                color: '#3f2d19',
              }}
            >
              📖
            </button>

            <button
              onClick={() => setReadingTheme('light')}
              title="Mode Terang (Light)"
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#ffffff',
                border: readingTheme === 'light' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: '#0f172a',
              }}
            >
              <MdLightMode />
            </button>

            <button
              onClick={() => setReadingTheme('dark')}
              title="Mode Malam (Dark)"
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#0f172a',
                border: readingTheme === 'dark' ? '2px solid #60a5fa' : '1px solid #334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: '#f8fafc',
              }}
            >
              <MdDarkMode />
            </button>
          </div>

          {/* Zoom Controls (Active in text mode) */}
          {viewMode === 'text' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: 8,
                padding: '2px 4px',
              }}
            >
              <button
                onClick={() => setZoomLevel(z => Math.max(80, z - 10))}
                title="Perkecil Ukuran Teks"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: currentTheme.textPrimary,
                  cursor: 'pointer',
                  padding: 4,
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <MdZoomOut />
              </button>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '0 4px', minWidth: 38, textAlign: 'center' }}>
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(z => Math.min(160, z + 10))}
                title="Perbesar Ukuran Teks"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: currentTheme.textPrimary,
                  cursor: 'pointer',
                  padding: 4,
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <MdZoomIn />
              </button>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            title="Salin Tautan E-Book"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: currentTheme.headerBg,
              border: `1px solid ${currentTheme.border}`,
              color: copied ? '#16a34a' : currentTheme.textPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 18,
            }}
          >
            {copied ? <MdCheck /> : <MdShare />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (F11)'}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: currentTheme.headerBg,
              border: `1px solid ${currentTheme.border}`,
              color: currentTheme.textPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 18,
            }}
          >
            {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
          </button>

          {/* Download Original PDF */}
          {ebook.fileUrl && (
            <a
              href={ebook.fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: currentTheme.accent,
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: 10,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 13,
                boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
              }}
              title="Unduh file modul lengkap"
            >
              <MdDownload style={{ fontSize: 17 }} />
              <span className="reader-btn-download-text">Unduh PDF</span>
            </a>
          )}
        </div>
      </header>

      {/* ── 1-LAYAR MAIN READING CANVAS ── */}
      <main
        style={{
          flex: 1,
          width: '100%',
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
        }}
      >
        {viewMode === 'pdf' ? (
          /* Mode 1: Dokumen PDF Asli 1 Layar Penuh */
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#525659',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              title={ebook.title}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                flex: 1,
              }}
            />
            {/* Safe fallback indicator if iframe is blocked */}
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                right: 20,
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                pointerEvents: 'none',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span>📖 Tampilan 1 Layar Dokumen Resmi</span>
            </div>
          </div>
        ) : (
          /* Mode 2: Teks Bersih & Bab Modul (Distraction-Free Clean Reading) */
          <div
            style={{
              width: '100%',
              maxWidth: 820,
              margin: '0 auto',
              padding: '40px 24px 80px',
              fontSize: `${zoomLevel}%`,
              lineHeight: 1.85,
            }}
          >
            {/* Book Cover Banner in Clean Text Mode */}
            <div
              style={{
                display: 'flex',
                gap: 24,
                marginBottom: 36,
                paddingBottom: 28,
                borderBottom: `1px solid ${currentTheme.border}`,
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              {ebook.imageUrl && (
                <img
                  src={ebook.imageUrl}
                  alt={ebook.title}
                  style={{
                    width: 140,
                    height: 190,
                    objectFit: 'cover',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    border: `1px solid ${currentTheme.border}`,
                  }}
                />
              )}

              <div style={{ flex: 1, minWidth: 260 }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 800,
                    color: currentTheme.accent,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  MODUL PEMBELAJARAN DIGITAL
                </span>
                <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 10px', lineHeight: 1.3 }}>
                  {ebook.title}
                </h1>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: currentTheme.textSecondary, flexWrap: 'wrap' }}>
                  {ebook.author && <span>✍️ Penulis: <strong>{ebook.author}</strong></span>}
                  <span>🏛️ Afiliasi: <strong>{ukmName}</strong></span>
                  <span>📅 Terbit: <strong>{ebook.year || '2026'}</strong></span>
                  {ebook.fileSize && <span>📦 File: <strong>{ebook.fileSize}</strong></span>}
                </div>
              </div>
            </div>

            {/* Book Overview / Introduction */}
            <div
              style={{
                background: currentTheme.bg,
                padding: '24px 28px',
                borderRadius: 16,
                border: `1px solid ${currentTheme.border}`,
                marginBottom: 32,
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px', color: currentTheme.accent }}>
                📌 Ringkasan & Silabus Materi
              </h3>
              <p style={{ margin: 0, fontSize: 14.5, whiteSpace: 'pre-line' }}>
                {ebook.description || 'Modul pembelajaran resmi UKM STMIK Lombok.'}
              </p>
            </div>

            {/* Interactive Chapter / Bab Modul */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div
                style={{
                  background: currentTheme.bg,
                  padding: '20px 24px',
                  borderRadius: 14,
                  border: `1px solid ${currentTheme.border}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: currentTheme.accent }}>BAB 1</span>
                  <span style={{ fontSize: 11, color: currentTheme.textSecondary }}>Halaman 1 - 24</span>
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px' }}>
                  Fundamental & Dasar Pembelajaran Praktis
                </h4>
                <p style={{ margin: 0, fontSize: 13.5, color: currentTheme.textSecondary }}>
                  Membahas pemahaman esensial, persiapan lingkungan kerja (tools & setup), serta pengenalan konsep arsitektur yang digunakan dalam kegiatan UKM.
                </p>
              </div>

              <div
                style={{
                  background: currentTheme.bg,
                  padding: '20px 24px',
                  borderRadius: 14,
                  border: `1px solid ${currentTheme.border}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: currentTheme.accent }}>BAB 2</span>
                  <span style={{ fontSize: 11, color: currentTheme.textSecondary }}>Halaman 25 - 68</span>
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px' }}>
                  Studi Kasus, Praktik Terpandu & Latihan Mandiri
                </h4>
                <p style={{ margin: 0, fontSize: 13.5, color: currentTheme.textSecondary }}>
                  Latihan langsung pembuatan proyek portofolio, penerapan standar industri, dan penyelesaian masalah teknis di lapangan.
                </p>
              </div>

              <div
                style={{
                  background: currentTheme.bg,
                  padding: '20px 24px',
                  borderRadius: 14,
                  border: `1px solid ${currentTheme.border}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: currentTheme.accent }}>BAB 3</span>
                  <span style={{ fontSize: 11, color: currentTheme.textSecondary }}>Halaman 69 - Akhir</span>
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px' }}>
                  Tips Kompetisi, Evaluasi & Rujukan Belajar Lanjutan
                </h4>
                <p style={{ margin: 0, fontSize: 13.5, color: currentTheme.textSecondary }}>
                  Panduan persiapan mengikuti lomba dan sertifikasi, cheatsheet referensi cepat, dan rujukan repositori resmi.
                </p>
              </div>
            </div>

            {/* Bottom Callout to read PDF */}
            <div
              style={{
                marginTop: 40,
                textAlign: 'center',
                padding: '28px 20px',
                background: currentTheme.bg,
                borderRadius: 16,
                border: `1px dashed ${currentTheme.accent}`,
              }}
            >
              <h4 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800 }}>
                Ingin Membaca Layout Buku Asli?
              </h4>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: currentTheme.textSecondary }}>
                Gunakan mode Dokumen PDF untuk navigasi visual halaman penuh atau unduh salinan PDF ke laptop Anda.
              </p>
              <button
                onClick={() => setViewMode('pdf')}
                style={{
                  background: currentTheme.accent,
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <MdMenuBook style={{ fontSize: 18 }} /> Buka Mode PDF 1 Layar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
