// src/components/EventBannerCarousel.jsx
// Modern Compact Multi-Device Responsive Event & Agenda Banner Carousel
import { useState, useEffect } from 'react';
import {
  FiCalendar, FiClock, FiMapPin, FiChevronLeft, FiChevronRight,
  FiCheckCircle, FiRadio, FiMinimize2, FiMaximize2
} from 'react-icons/fi';

export default function EventBannerCarousel({
  events = [],
  activeUkmName = '',
  autoIntervalMs = 5000,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompact, setIsCompact] = useState(false);

  const total = events.length;

  // Auto-slide effect every 5 seconds (5000ms) with progress bar
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    setProgress(0);
    const intervalTick = 50; // update progress every 50ms for silky smooth bar
    const step = 100 / (autoIntervalMs / intervalTick);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentIndex(curr => (curr + 1) % total);
          return 0;
        }
        return prev + step;
      });
    }, intervalTick);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, total, autoIntervalMs]);

  if (!events || events.length === 0) return null;

  const currentEvent = events[currentIndex] || events[0];
  const evDate = currentEvent?.startTime ? new Date(currentEvent.startTime) : new Date();

  // Full and short dates for responsive display
  const fullDateStr = evDate.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const shortDateStr = evDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const timeStr = evDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA';

  const handlePrev = (e) => {
    e.stopPropagation();
    setProgress(0);
    setCurrentIndex(prev => (prev - 1 + total) % total);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setProgress(0);
    setCurrentIndex(prev => (prev + 1) % total);
  };

  const handleDotClick = (idx, e) => {
    e.stopPropagation();
    setProgress(0);
    setCurrentIndex(idx);
  };

  // Modern vibrant gradients for visual dynamism per slide
  const bannerGradients = [
    'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #0284c7 100%)', // Tech Blue/Cyan
    'linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #a855f7 100%)', // Creative Purple
    'linear-gradient(135deg, #064e3b 0%, #059669 55%, #10b981 100%)', // Nature Emerald
    'linear-gradient(135deg, #831843 0%, #db2777 55%, #f43f5e 100%)', // Artistic Rose
    'linear-gradient(135deg, #78350f 0%, #d97706 55%, #f59e0b 100%)', // Active Amber
  ];
  const currentGradient = bannerGradients[currentIndex % bannerGradients.length];
  const ukmName = currentEvent?.ukm?.name || activeUkmName || 'UKM STMIK Lombok';

  // ── ULTRA COMPACT TICKER MODE (If user toggled minimize for maximum screen space) ──
  if (isCompact) {
    return (
      <div
        className="event-banner-carousel-container event-banner-collapsed"
        style={{
          background: currentGradient,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          cursor: 'pointer',
        }}
        onClick={() => setIsCompact(false)}
        title="Klik untuk memperbesar banner agenda"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.22)',
              fontSize: 10.5,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            AGENDA ({currentIndex + 1}/{total})
          </span>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentEvent.title} &bull; <span style={{ opacity: 0.85, fontWeight: 500 }}>{shortDateStr}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsCompact(false);
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#fff',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 11,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <FiMaximize2 style={{ fontSize: 12 }} /> Buka
        </button>
      </div>
    );
  }

  // ── STANDARD COMPACT RESPONSIVE BANNER MODE ──
  return (
    <div
      className="event-banner-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ background: currentGradient }}
    >
      {/* Decorative Subtle Background Glows (bounded to prevent overflow) */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Bar: Compact Badges & Sleek Controls */}
      <div className="event-banner-top-bar">
        {/* Left Badges */}
        <div className="event-banner-badges">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(6px)',
              padding: '3px 8px',
              borderRadius: 999,
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: 0.3,
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            <FiRadio style={{ fontSize: 11, animation: 'simkasPulse 1.5s infinite' }} />
            AGENDA UKM
          </span>

          <span
            style={{
              background: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(4px)',
              padding: '3px 9px',
              borderRadius: 999,
              fontSize: 10.5,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 160,
              flexShrink: 0,
            }}
          >
            {ukmName}
          </span>

          <span
            className="event-banner-visibility-pill"
            style={{
              background: currentEvent?.visibility === 'publik' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)',
              color: '#ffffff',
              padding: '3px 8px',
              borderRadius: 999,
              fontSize: 10.5,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {currentEvent?.visibility === 'publik' ? 'Umum' : 'Internal'}
          </span>
        </div>

        {/* Right Controls: Mini Counter, Toggle Compact, & Nav Arrows */}
        <div className="event-banner-controls">
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              background: 'rgba(0, 0, 0, 0.28)',
              padding: '3px 8px',
              borderRadius: 999,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
            title={isPaused ? 'Rotasi dijeda saat mouse berada di banner' : 'Berganti otomatis setiap 5 detik'}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: isPaused ? '#f59e0b' : '#22c55e',
              }}
            />
            <span>{currentIndex + 1}/{total}</span>
          </div>

          <button
            type="button"
            className="event-banner-nav-btn"
            onClick={handlePrev}
            title="Event Sebelumnya"
          >
            <FiChevronLeft style={{ fontSize: 15 }} />
          </button>

          <button
            type="button"
            className="event-banner-nav-btn"
            onClick={handleNext}
            title="Event Berikutnya"
          >
            <FiChevronRight style={{ fontSize: 15 }} />
          </button>

          <button
            type="button"
            className="event-banner-nav-btn"
            onClick={() => setIsCompact(true)}
            title="Kecilkan banner agar tampilan lebih luas"
            style={{ opacity: 0.8 }}
          >
            <FiMinimize2 style={{ fontSize: 12 }} />
          </button>
        </div>
      </div>

      {/* Main Content: Sleek Title & One-line Description */}
      <div className="event-banner-content">
        <h2 className="event-banner-title">
          {currentEvent.title}
        </h2>
        {currentEvent.description && (
          <p className="event-banner-desc">
            {currentEvent.description}
          </p>
        )}
      </div>

      {/* Meta Bar: Date, Time & Location in a Single Row */}
      <div className="event-banner-meta">
        <div className="event-banner-meta-item">
          <FiCalendar style={{ fontSize: 13, opacity: 0.9 }} />
          <span>{fullDateStr}</span>
        </div>

        <span style={{ opacity: 0.4 }}>•</span>

        <div className="event-banner-meta-item">
          <FiClock style={{ fontSize: 13, opacity: 0.9 }} />
          <span>{timeStr}</span>
        </div>

        <span style={{ opacity: 0.4 }}>•</span>

        <div className="event-banner-meta-item">
          <FiMapPin style={{ fontSize: 13, opacity: 0.9 }} />
          <span style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentEvent.location || 'Kampus STMIK Lombok'}
          </span>
        </div>

        <div className="event-banner-status-badge">
          <FiCheckCircle style={{ color: '#16a34a', fontSize: 12 }} />
          <span>{currentEvent.status === 'terlaksana' ? 'Terlaksana' : 'Siap Diikuti'}</span>
        </div>
      </div>

      {/* Bottom Row: Slim Indicator Dots & Progress Bar */}
      <div style={{ marginTop: 8, position: 'relative', zIndex: 2 }}>
        {/* Compact Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          {events.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleDotClick(idx, e)}
              title={`Pindah ke Slide ${idx + 1}`}
              style={{
                width: idx === currentIndex ? 18 : 6,
                height: 5,
                borderRadius: 999,
                background: idx === currentIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>

        {/* Slim 2.5px 5-Second Progress Bar */}
        <div
          style={{
            width: '100%',
            height: 2.5,
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.22)',
            overflow: 'hidden',
          }}
          title="Indikator rotasi otomatis 5 detik"
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: '#ffffff',
              transition: isPaused ? 'none' : 'width 0.05s linear',
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    </div>
  );
}
