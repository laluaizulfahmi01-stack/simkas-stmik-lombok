// src/components/LogoutConfirmModal.jsx
// Dialog konfirmasi modern untuk keluar dari sesi akun SIMKAS
import { useEffect } from 'react';
import { FiLogOut, FiX } from 'react-icons/fi';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm, user }) {
  // Listen to keyboard shortcuts (Escape to cancel, Enter to confirm)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const roleLabel =
    user?.role === 'superadmin' ? 'Super Administrator' :
    user?.role === 'manager'    ? 'Pengelola UKM' :
                                  'Mahasiswa STMIK Lombok';

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        style={{
          position: 'relative',
          maxWidth: 440,
          width: '100%',
          borderRadius: 24,
          padding: '32px 28px 26px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 30px rgba(239, 68, 68, 0.08)',
          textAlign: 'center',
          overflow: 'hidden',
          animation: 'simkasCardCascade 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Soft top ambient red glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: 90,
            background: 'radial-gradient(ellipse at top, rgba(239, 68, 68, 0.18) 0%, transparent 75%)',
            pointerEvents: 'none',
          }}
        />

        {/* Close Button top-right */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup konfirmasi"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--bg-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 18,
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.background = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'var(--bg-subtle)';
          }}
        >
          <FiX />
        </button>

        {/* Exit Icon Badge with Red Gradient & Border */}
        <div
          style={{
            position: 'relative',
            width: 68,
            height: 68,
            borderRadius: '50%',
            margin: '0 auto 20px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            fontSize: 30,
            boxShadow: '0 8px 24px -4px rgba(239, 68, 68, 0.25)',
          }}
        >
          <FiLogOut style={{ transform: 'translateX(2px)' }} />
        </div>

        {/* Title */}
        <h3
          id="logout-confirm-title"
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}
        >
          Konfirmasi Keluar
        </h3>

        {/* Subtitle / Question */}
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            marginBottom: 20,
            padding: '0 4px',
          }}
        >
          Apakah Anda yakin ingin keluar dari akun SIMKAS? Sesi aktif Anda akan diakhiri dan Anda perlu login kembali untuk mengakses data.
        </p>

        {/* User Capsule Info */}
        {user && (
          <div
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'var(--grad-hero)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 14,
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.name || 'Pengguna SIMKAS'}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.nim ? `${user.nim} • ` : ''}{roleLabel}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons: Batal vs Ya, Keluar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            style={{
              padding: '12px 18px',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)',
            }}
          >
            Batal
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            style={{
              padding: '12px 18px',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 800,
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
              transition: 'var(--transition)',
            }}
          >
            <FiLogOut style={{ fontSize: 16 }} />
            <span>Ya, Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

