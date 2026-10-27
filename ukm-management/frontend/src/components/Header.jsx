import React from 'react';
import { Link } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';

export default function Header() {
  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border)',
        padding: '16px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(10, 37, 64, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <img
            src="/simkas-logo.png"
            alt="Logo SIMKAS"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scale(1.42)',
            }}
          />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', letterSpacing: -0.3 }}>
            SIMKAS
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)' }}>STMIK LOMBOK</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/login" className="btn btn-ghost btn-sm" style={{ padding: '8px 18px' }}>
          Masuk
        </Link>
        <Link to="/register" className="btn btn-primary btn-sm" style={{ padding: '8px 20px' }}>
          Daftar Mahasiswa
        </Link>
      </div>
    </header>
  );
}
