// src/components/SimkasLoader.jsx
import { useEffect, useState } from 'react';

/**
 * SimkasLoader: High-performance, aesthetic loading screen featuring
 * the official SIMKAS squircle logo with silky-smooth glowing halo and motion.
 */
export default function SimkasLoader({
  fullScreen = true,
  title = 'SIMKAS',
  subtitle = 'Menyiapkan Portal UKM...',
  progress = null,
  badge = 'Sistem Informasi Manajemen UKM STMIK Lombok',
  isExiting = false,
  size = 'normal',
}) {
  const [internalProgress, setInternalProgress] = useState(progress ?? 20);

  // If indeterminate, provide an organic progressing illusion
  useEffect(() => {
    if (progress !== null && progress !== undefined) {
      setInternalProgress(progress);
      return;
    }
    const interval = setInterval(() => {
      setInternalProgress(prev => {
        if (prev >= 95) return 95;
        const jump = Math.max(2, Math.floor((100 - prev) / 6));
        return prev + jump;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [progress]);

  const effectiveProgress = progress ?? internalProgress;

  const content = (
    <div className={`simkas-loader-card simkas-loader-size-${size}`}>
      {/* ── Glowing Halo & 3D Squircle Logo ── */}
      <div className="simkas-logo-halo-wrapper">
        <div className="simkas-logo-halo-ring" />
        <div className="simkas-logo-halo-blur" />
        <div className="simkas-logo-inner-box">
          <img
            src="/simkas-logo.png"
            alt="Logo SIMKAS"
            className="simkas-logo-img"
          />
          <div className="simkas-logo-shimmer" />
        </div>
      </div>

      {/* ── Brand Title & Live Status ── */}
      <div className="simkas-loader-title">{title}</div>
      <div className="simkas-loader-sub">
        <span className="simkas-pulse-dot" />
        <span>{subtitle}</span>
      </div>

      {/* ── Smooth Progress Track ── */}
      <div className="simkas-progress-track">
        <div
          className="simkas-progress-bar"
          style={{ width: `${Math.min(100, Math.max(5, effectiveProgress))}%` }}
        />
      </div>

      {/* ── Bottom Institutional Badge ── */}
      {badge && (
        <div className="simkas-loader-badge">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: 4 }}
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>{badge}</span>
        </div>
      )}
    </div>
  );

  if (!fullScreen) {
    return (
      <div className={`simkas-loader-inline ${isExiting ? 'is-exiting' : ''}`}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={`simkas-loader-overlay ${isExiting ? 'is-exiting' : ''}`}
      role="status"
      aria-live="polite"
    >
      {/* Ambient background glows */}
      <div className="simkas-ambient-glow simkas-ambient-blue" />
      <div className="simkas-ambient-glow simkas-ambient-cyan" />
      {content}
    </div>
  );
}
