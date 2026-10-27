# SIMKAS - Development Roadmap & Action Plan

---

## 📅 Rencana Kerja Berkelanjutan (Phase-by-Phase Roadmap)

```
[Phase 1: Foundation & Auth] ──> [Phase 2: Core Modules] ──> [Phase 3: Polish & Deployment]
      ✅ SELESAI                       🔄 ON-PROGRESS                     ⏳ NEXT
```

---

### Fase 1: Fondasi Sistem & Arsitektur (Status: Selesai ✅)
- [x] Inisialisasi arsitektur monorepo terpisah (`frontend/` Vite React & `backend/` Express Node.js).
- [x] Konfigurasi basis data Sequelize dengan dukungan dual driver (SQLite lokal & Supabase PostgreSQL cloud).
- [x] Implementasi sistem autentikasi JWT lengkap (Register, Login, Hash Password, Session persistence).
- [x] Pembatasan aturan bisnis: Setiap mahasiswa maksimal mendaftar di 2 UKM.
- [x] Seeding data awal untuk 4 UKM resmi: *Techcode, Gumpala, Haluner, Ceria*.

---

### Fase 2: Implementasi Modul Fungsional Utama (Status: On-Progress 🔄)

#### 1. Modul Manajemen Uang Kas & Transparansi
- [x] Endpoint backend CRUD transaksi masuk & keluar per UKM.
- [x] Form input kas khusus pengurus/manager UKM.
- [ ] Ringkasan analitik visual grafik kas (Pemasukan vs Pengeluaran per bulan).
- [ ] Ekspor data laporan kas ke file CSV / Excel / PDF untuk arsip LPJ.

#### 2. Modul Absensi Digital & Izin Kegiatan
- [x] Model `Meeting`, `Attendance`, dan `LeaveRequest`.
- [x] Endpoint check-in mandiri dan submit izin sakit/alasan.
- [ ] UI Generator QR Code pertemuan interaktif di dashboard pengurus.
- [ ] Tampilan scan kamera / input kode sesi cepat di smartphone mahasiswa.
- [ ] Panel approval surat izin mahasiswa oleh manajer UKM.

#### 3. Modul E-Book, Modul Materi & Prestasi
- [x] Model `Achievement` (prestasi & piala).
- [ ] Fitur upload modul e-book/panduan materi resmi per UKM.
- [ ] Halaman galeri prestasi interaktif dengan filter tahun & tingkat kejuaraan.

---

### Fase 3: UI/UX Harmonization, Motion & Multi-Role Settings (Status: Selesai ✅)
- [x] Standardisasi tema CSS (*Plus Jakarta Sans*, token warna HSL/Hex, micro-interactions).
- [x] Kalibrasi Dark Mode Modern Slate-Navy (`#0f172a` canvas, `#1e293b` surface card) dan Light Mode nyaman.
- [x] Menghilangkan patahan kasar di halaman login dengan ambient radial mesh gradient.
- [x] Integrasi tata letak responsif mobile (Bottom navigation bar `MobileNav.jsx` dengan tombol navigasi, tema & setelan).
- [x] Efek Motion 3D interaktif Three.js di Landing Page Hero & kartu UKM.
- [x] Modul Setelan Akun Terpadu (`SettingsPage.jsx`) untuk Mahasiswa, Pengelola UKM, dan Super Admin:
  - [x] Upload / hapus foto profil avatar real-time.
  - [x] Sistem verifikasi identitas (KTM mahasiswa, SK pengelola) dan panel review admin.
  - [x] Penggantian password dengan hashing aman.
  - [x] Switcher tema dan personalisasi akun.

---

### Fase 4: QA, Testing, & Production Launch (Status: Mendatang ⏳)
- [ ] Audit keamanan endpoint API dan sanitasi input.
- [ ] Migrasi database production ke Supabase PostgreSQL.
- [ ] Deployment frontend (Vercel/Netlify) & backend (Render/Railway/VPS).
- [ ] Penyusunan Buku Panduan Pengguna (User Manual) untuk mahasiswa & BEM STMIK Lombok.
