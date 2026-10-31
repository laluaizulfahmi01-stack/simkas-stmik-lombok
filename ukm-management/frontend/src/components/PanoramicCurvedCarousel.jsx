import { useState, useEffect, useRef, useCallback } from 'react';
import { FiArrowRight, FiCalendar, FiMapPin, FiX } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const activityPhotos = [
  {
    id: 'p-1',
    ukm: 'UKM Techcode',
    title: 'Hackathon NTB & Smart AI',
    sub: 'Pengembangan Inovasi Software & AI',
    tag: '#01 Coding & AI',
    location: 'Lab Komputer STMIK',
    year: '2025/2026',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    color: '#3f6212',
    bg: '#ecfccb',
  },
  {
    id: 'p-2',
    ukm: 'UKM Gumpala',
    title: 'Ekspedisi 3.726 MDPL',
    sub: 'Puncak Anjani & Aksi Bebas Sampah',
    tag: '#02 Rimba & Konservasi',
    location: 'Gunung Rinjani Lombok',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    color: '#1d4ed8',
    bg: '#dbeafe',
  },
  {
    id: 'p-3',
    ukm: 'UKM Haluner',
    title: 'Festival Musik Akustik',
    sub: 'Aransemen Lagu Sasak Kontemporer',
    tag: '#03 Musik & Kesenian',
    location: 'Auditorium STMIK',
    year: '2025/2026',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    color: '#6d28d9',
    bg: '#ede9fe',
  },
  {
    id: 'p-4',
    ukm: 'UKM Ceria',
    title: 'Juara 1 Turnamen Futsal',
    sub: 'Rekor Tak Terkalahkan Se-Lombok',
    tag: '#04 Olahraga Mahasiswa',
    location: 'GOR Rembiga Lombok',
    year: '2025',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
    color: '#c2410c',
    bg: '#ffedd5',
  },
  {
    id: 'p-5',
    ukm: 'UKM Techcode',
    title: 'Tech-Camp 24 Jam',
    sub: 'Bootcamp Web Modern & Open Source',
    tag: '#01 Coding & AI',
    location: 'Lab Jaringan & Cloud',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    color: '#3f6212',
    bg: '#ecfccb',
  },
  {
    id: 'p-6',
    ukm: 'UKM Gumpala',
    title: 'Survival & Navigasi Darat',
    sub: 'Medan Peta Kompas & PPGD Rimba',
    tag: '#02 Rimba & Konservasi',
    location: 'Hutan Sembalun',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    color: '#1d4ed8',
    bg: '#dbeafe',
  },
  {
    id: 'p-7',
    ukm: 'UKM Haluner',
    title: 'Tari Tradisional Sasak',
    sub: 'Pentas Seni Dies Natalis Kampus',
    tag: '#03 Musik & Kesenian',
    location: 'Panggung Terbuka',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
    color: '#6d28d9',
    bg: '#ede9fe',
  },
  {
    id: 'p-8',
    ukm: 'UKM Ceria',
    title: 'Championship MLBB & PUBGM',
    sub: 'Turnamen E-Sports Antar Semester',
    tag: '#04 Olahraga Mahasiswa',
    location: 'Arena E-Sports STMIK',
    year: '2026',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    color: '#c2410c',
    bg: '#ffedd5',
  },
];

// Repeat 3 times for seamless infinite loop
const infiniteList = [...activityPhotos, ...activityPhotos, ...activityPhotos];

export default function PanoramicCurvedCarousel() {
  const { isDark } = useTheme();
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [transforms, setTransforms] = useState([]);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const animFrameRef = useRef(null);
  const scrollPosRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const CARD_WIDTH = isMobile ? 175 : 230;
  const CARD_HEIGHT = isMobile ? '270px' : '350px';
  const GAP = isMobile ? 12 : 18;
  const SINGLE_SET_WIDTH = activityPhotos.length * (CARD_WIDTH + GAP);

  // Update 3D transforms for each card to form the iconic IMAX concave arc
  const updateCardTransforms = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth || 1000;
    const centerX = containerWidth / 2;
    const scrollLeft = scrollPosRef.current;

    const newTransforms = infiniteList.map((_, i) => {
      const cardCenter = i * (CARD_WIDTH + GAP) + CARD_WIDTH / 2 - scrollLeft;
      // Normalized distance from center (-1 to 1)
      const distFromCenter = (cardCenter - centerX) / (containerWidth / 2);
      const clampedDist = Math.max(-1.4, Math.min(1.4, distFromCenter));

      // Concave cylinder perspective formula (gentler on mobile to avoid squishing):
      const rotateY = isMobile ? -clampedDist * 16 : -clampedDist * 34;
      const scale = isMobile
        ? 0.94 + Math.min(Math.abs(clampedDist), 1) * 0.1
        : 0.88 + Math.min(Math.abs(clampedDist), 1.2) * 0.32;
      const translateY = isMobile
        ? Math.pow(Math.abs(clampedDist), 1.5) * 10
        : Math.pow(Math.abs(clampedDist), 1.7) * 22;

      return {
        rotateY,
        scale,
        translateY,
        opacity: Math.abs(clampedDist) > 1.35 ? 0.35 : 1,
      };
    });

    setTransforms(newTransforms);
  }, [CARD_WIDTH, GAP, isMobile]);

  // Continuous smooth auto-sliding loop (requestAnimationFrame)
  useEffect(() => {
    // Start somewhere in the middle set
    scrollPosRef.current = SINGLE_SET_WIDTH;

    let lastTime = performance.now();

    const loop = (currentTime) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (!isHovered && !isDraggingRef.current) {
        // Smooth constant speed: ~40px per second
        scrollPosRef.current += (40 * delta) / 1000;

        // Infinite wrap seamlessly
        if (scrollPosRef.current >= SINGLE_SET_WIDTH * 2) {
          scrollPosRef.current -= SINGLE_SET_WIDTH;
        } else if (scrollPosRef.current < SINGLE_SET_WIDTH) {
          scrollPosRef.current += SINGLE_SET_WIDTH;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${scrollPosRef.current}px)`;
        }
        updateCardTransforms();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    updateCardTransforms();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isHovered, updateCardTransforms, SINGLE_SET_WIDTH]);

  // Handle manual dragging (mouse & touch)
  const onMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.pageX || e.touches?.[0]?.pageX || 0;
    dragStartScrollRef.current = scrollPosRef.current;
  };

  const onMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const currentX = e.pageX || e.touches?.[0]?.pageX || 0;
    const diff = currentX - dragStartXRef.current;
    scrollPosRef.current = dragStartScrollRef.current - diff;

    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${scrollPosRef.current}px)`;
    }
    updateCardTransforms();
  };

  const onMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        padding: isMobile ? '36px 0 44px' : '60px 0 80px',
        overflow: 'hidden',
        background: isDark ? '#0b1120' : '#ffffff',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
        transition: 'background 0.3s ease, border 0.3s ease',
      }}
    >
      {/* ── Section Header matching Reference Image exactly ── */}
      <div style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 40px', padding: '0 24px' }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: 14,
            fontWeight: 800,
            color: '#f97316',
            letterSpacing: 0.3,
            marginBottom: 10,
          }}
        >
          Behind the Activities
        </span>

        <h2
          style={{
            fontSize: 'clamp(32px, 4.8vw, 48px)',
            fontWeight: 900,
            color: isDark ? '#f8fafc' : '#09090b',
            letterSpacing: -1.2,
            margin: '0 0 16px',
            lineHeight: 1.15,
          }}
        >
          Curious What Else We’ve Created?
        </h2>

        <p
          style={{
            fontSize: 15,
            color: isDark ? '#94a3b8' : '#64748b',
            lineHeight: 1.6,
            maxWidth: 620,
            margin: '0 auto 24px',
          }}
        >
          Explore more student activities, field expeditions, tech hackathons, and creative arts from 4 official organizations at STMIK Lombok.
        </p>

        {/* Small Action Pill Link matching reference */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <a
            href="#daftar-ukm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              fontWeight: 700,
              color: isDark ? '#f8fafc' : '#09090b',
              background: isDark ? '#1e293b' : '#ffffff',
              padding: '8px 18px',
              borderRadius: 999,
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              textDecoration: 'none',
              boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>See more Activities</span>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#f97316',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              ↗
            </span>
          </a>
        </div>
      </div>

      {/* ── 3D Concave Cylindrical Arc Viewport ── */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          isDraggingRef.current = false;
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onMouseDown}
        onTouchMove={onMouseMove}
        onTouchEnd={onMouseUp}
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          padding: isMobile ? '12px 0 20px' : '30px 0 40px',
          cursor: isDraggingRef.current ? 'grabbing' : 'grab',
          perspective: isMobile ? 800 : 1200,
          perspectiveOrigin: '50% 50%',
          userSelect: 'none',
        }}
      >
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: `${GAP}px`,
            width: 'max-content',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            alignItems: 'center',
          }}
        >
          {infiniteList.map((photo, i) => {
            const tr = transforms[i] || { rotateY: 0, scale: 1, translateY: 0, opacity: 1 };

            return (
              <div
                key={`${photo.id}-${i}`}
                onClick={() => setSelectedPhoto(photo)}
                style={{
                  position: 'relative',
                  width: `${CARD_WIDTH}px`,
                  height: CARD_HEIGHT,
                  borderRadius: isMobile ? '18px' : '26px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  transform: `rotateY(${tr.rotateY}deg) scale(${tr.scale}) translateY(${tr.translateY}px)`,
                  opacity: tr.opacity,
                  transition: isHovered
                    ? 'transform 0.25s ease, box-shadow 0.25s ease'
                    : 'transform 0.1s linear, opacity 0.15s ease',
                  boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.25)',
                  background: '#09090b',
                  cursor: 'pointer',
                }}
              >
                {/* 100% Pure Clean Photo - Tanpa teks menutupi foto persis referensi */}
                <img
                  src={photo.image}
                  alt={photo.title}
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4 Numbered Columns matching Reference Image (// 01, // 02, etc.) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? 12 : 20,
          maxWidth: 960,
          margin: '24px auto 0',
          padding: isMobile ? '0 16px' : '0 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ padding: '8px 12px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#f97316', letterSpacing: 0.5, marginBottom: 4 }}>
            // 01
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#f8fafc' : '#09090b' }}>
            Coding & Innovation
          </div>
          <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginTop: 2 }}>
            UKM Techcode
          </div>
        </div>

        <div style={{ padding: '8px 12px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#3b82f6', letterSpacing: 0.5, marginBottom: 4 }}>
            // 02
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#f8fafc' : '#09090b' }}>
            Nature & Conservation
          </div>
          <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginTop: 2 }}>
            UKM Gumpala
          </div>
        </div>

        <div style={{ padding: '8px 12px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#8b5cf6', letterSpacing: 0.5, marginBottom: 4 }}>
            // 03
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#f8fafc' : '#09090b' }}>
            Art & Culture
          </div>
          <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginTop: 2 }}>
            UKM Haluner
          </div>
        </div>

        <div style={{ padding: '8px 12px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#ea580c', letterSpacing: 0.5, marginBottom: 4 }}>
            // 04
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#f8fafc' : '#09090b' }}>
            Sports & E-Sports
          </div>
          <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginTop: 2 }}>
            UKM Ceria
          </div>
        </div>
      </div>

      {/* ── Modal Pop-up Foto Besar ── */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.82)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isDark ? '#1e293b' : '#ffffff',
              borderRadius: 24,
              maxWidth: 580,
              width: '100%',
              overflow: 'hidden',
              boxShadow: isDark
                ? '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                : '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
              border: isDark ? '1px solid #334155' : '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <div style={{ position: 'relative', height: 320, width: '100%', overflow: 'hidden' }}>
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <FiX style={{ fontSize: 18 }} />
              </button>
              <div
                style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  background: selectedPhoto.bg,
                  color: selectedPhoto.color,
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '6px 14px',
                  borderRadius: 999,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
              >
                {selectedPhoto.ukm}
              </div>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 8, fontWeight: 700 }}>
                <FiCalendar style={{ fontSize: 14 }} />
                <span>Tahun {selectedPhoto.year}</span>
                <span>•</span>
                <FiMapPin style={{ fontSize: 14 }} />
                <span>{selectedPhoto.location}</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: isDark ? '#f8fafc' : '#09090b', margin: '0 0 10px', lineHeight: 1.3 }}>
                {selectedPhoto.title}
              </h3>
              <p style={{ fontSize: 14, color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.6, margin: '0 0 24px' }}>
                {selectedPhoto.sub}. Dokumentasi kegiatan resmi mahasiswa civitas akademika STMIK Lombok.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 999,
                    border: isDark ? '1px solid #475569' : '1px solid #e2e8f0',
                    background: isDark ? '#334155' : '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: isDark ? '#f8fafc' : '#09090b',
                  }}
                >
                  Tutup
                </button>
                <a
                  href="/register"
                  style={{
                    padding: '10px 24px',
                    borderRadius: 999,
                    background: '#f97316',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
                  }}
                >
                  <span>Daftar Sekarang</span>
                  <FiArrowRight />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
