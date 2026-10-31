# 📚 REFERENSI PROYEK SIMKAS

> Dokumen ini menampung seluruh referensi desain, teknologi, komponen UI, struktur endpoint, dan arsitektur sistem yang digunakan dalam pengembangan **SIMKAS – Sistem Informasi Manajemen UKM & Kas Transparan STMIK Lombok**.

---

## 🎨 Referensi Desain UI/UX

### 1. Influency Dashboard (Referensi Utama Halaman Kas)
- **Deskripsi:** Dashboard keuangan modern bergaya premium dengan stat cards, dual bar chart, dan overlapping bubble stats.
- **Elemen yang Diadopsi:**
  - 4 top stat cards (Lime Hero Card + 3 kartu reguler)
  - Dual rounded bar chart (65/35 split layout)
  - Overlapping bubble circles untuk visualisasi distribusi arus kas
  - Progress bar target capaian kas
  - Mini sparkline chart per entitas UKM
- **Warna Referensi:**
  - Lime Highlight: `#ccf726`
  - Sky Blue: `#93c5fd`
  - Dark Navy (tooltip): `#0f172a`
  - Lime Dark (text): `#65a30d`
- **File Terkait:**
  - `frontend/src/pages/manager/KasPage.jsx`
  - `frontend/src/pages/student/KasPage.jsx`
  - `frontend/src/index.css` (class prefix: `.pro-*`)

---

### 2. 3D Panoramic Curved Showcase (Showcase Dokumentasi Kegiatan)
- **Deskripsi:** Tampilan foto dokumentasi kegiatan UKM dengan lengkungan silinder IMAX 3D (Concave Cylindrical Arc) yang dapat bergeser otomatis (*continuous marquee loop*) dan mendukung interaksi geser kursor (*mouse / touch drag*).
- **Komponen:** `frontend/src/components/PanoramicCurvedCarousel.jsx`
- **Fitur Utama:**
  - Transformasi 3D dinamis (`perspective`, `rotateY`, `scale`, `translateY`) berpusat di tengah viewport
  - Click-to-enlarge modal popup foto kegiatan resolusi tinggi
  - 4 kolom bernomor (`// 01` Coding, `// 02` Rimba, `// 03` Seni, `// 04` Olahraga)
  - Dukungan tema otomatis (Light & Dark mode responsive)

---

### 3. Referensi Warna & Tema

| Token CSS | Mode Terang (Light) | Mode Gelap (Dark) | Keterangan |
|-----------|---------------------|-------------------|------------|
| `--bg-base` | `#ffffff` | `#0f172a` (Slate Navy) | Background kanvas aplikasi |
| `--bg-card` | `#ffffff` | `#1e293b` | Surface kartu & panel |
| `--bg-subtle` | `#f8fafc` | `#111827` | Background sekunder / input |
| `--border` | `#e2e8f0` | `#334155` | Garis batas komponen |
| `--text-primary` | `#0f172a` | `#f8fafc` | Tipografi teks utama |
| `--text-secondary` | `#475569` | `#94a3b8` | Subtitle & keterangan |
| `--text-muted` | `#94a3b8` | `#64748b` | Caption & placeholder |
| `--primary` | `#3b82f6` | `#3b82f6` | Aksen biru STMIK Lombok |
| Lime Hero | `#ccf726` | `#ccf726` | Aksen kartu saldo kas |

---

### 4. Font & Tipografi
- **Font Utama:** `Plus Jakarta Sans` & `Inter` (Google Fonts) — diimpor di `index.css`
- **Alternatif:** `system-ui`, `-apple-system`, `sans-serif`
- **Font Weight:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold), 900 (black)

---

## 🧩 Library & Teknologi yang Digunakan

### Frontend

| Library | Versi | Kegunaan |
|---------|-------|----------|
| **React** | ^18.x | Framework UI utama |
| **Vite** | ^8.x | High-speed bundler & dev server |
| **React Router DOM** | ^6.x | Client-side routing dengan proteksi peran |
| **Recharts** | ^2.x | Visualisasi grafik keuangan (Bar, Area, Sparkline) |
| **React Icons (MD & FI)** | ^5.x | Ikonografi Material Design & Feather Icons |
| **Axios** | ^1.x | HTTP client dengan auto-token injection |

### Backend

| Library | Versi | Kegunaan |
|---------|-------|----------|
| **Node.js** | 20.x | JavaScript backend runtime |
| **Express.js** | ^4.18.x | REST API server framework |
| **Sequelize** | ^6.37.x | ORM multi-dialect (SQLite & PostgreSQL) |
| **SQLite3** | ^5.x | Basis data lokal development |
| **pg & pg-hstore** | ^8.11.x | Driver PostgreSQL cloud (Supabase) |
| **JSON Web Token (JWT)** | ^9.x | Autentikasi stateless berbasis token |
| **bcryptjs** | ^2.4.x | Hashing password satu arah dengan salt |
| **Helmet** | ^8.3.x | Enterprise HTTP security headers |
| **express-rate-limit** | ^8.7.x | Pencegahan DDoS & Brute-force attacks |
| **CORS** | ^2.8.x | Proteksi origin & resource sharing |

---

## 📁 Struktur Folder Proyek

```
SIMKAS/
└── ukm-management/
    ├── backend/
    │   ├── config/               # Konfigurasi database dual-mode (SQLite / Supabase)
    │   ├── middleware/           # Middleware autentikasi JWT & otorisasi role
    │   ├── models/               # Model Sequelize & asosiasi relasi (User, Ukm, Kas, dll)
    │   ├── routes/               # Handler endpoint API (auth, ukm, transactions, dll)
    │   ├── security/             # Enterprise Cyber Security Suite & Audit Logging
    │   ├── src/
    │   │   └── index.js          # Entry point server Express
    │   ├── seed.js               # Data seeder 4 UKM resmi & riwayat kas 6-bulan
    │   ├── database.sqlite       # Database lokal SQLite
    │   ├── package.json          # Dependency backend
    │   ├── server.js             # Vercel serverless entry
    │   └── vercel.json           # Konfigurasi deployment Vercel
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── main.jsx          # Entry point React
    │   │   ├── App.jsx           # Rute utama aplikasi
    │   │   ├── index.css         # Styling global (token CSS & class .pro-*)
    │   │   ├── api/
    │   │   │   └── axios.js      # Konfigurasi Axios client
    │   │   ├── context/
    │   │   │   ├── AuthContext.jsx   # State sesi pengguna & peran
    │   │   │   └── ThemeContext.jsx  # State tema Light / Dark mode
    │   │   ├── components/
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── ProPageHeader.jsx
    │   │   │   ├── ThemeToggle.jsx
    │   │   │   ├── PanoramicCurvedCarousel.jsx
    │   │   │   ├── Toast.jsx
    │   │   │   └── ...
    │   │   └── pages/
    │   │       ├── LandingPage.jsx      # Halaman utama profil UKM & 3D carousel
    │   │       ├── LoginPage.jsx        # Login aman dengan sanitasi input
    │   │       ├── RegisterPage.jsx     # Pendaftaran mahasiswa baru & upload KTM
    │   │       ├── SettingsPage.jsx     # Setelan profil, password & dokumen
    │   │       ├── manager/
    │   │       │   ├── KasPage.jsx          # Dashboard kas UKM (Influency style)
    │   │       │   ├── AbsenPage.jsx        # Manajemen sesi, token QR & roster
    │   │       │   ├── AnggotaPage.jsx      # Daftar anggota & pengurus
    │   │       │   ├── CapaianPage.jsx      # Kelola arsip prestasi & e-book
    │   │       │   └── ManagerDashboard.jsx
    │   │       ├── student/
    │   │       │   ├── KasPage.jsx          # Transparansi kas mahasiswa
    │   │       │   ├── AbsenPage.jsx        # Check-in token mandiri & submit izin
    │   │       │   ├── CapaianPage.jsx      # Galeri karya & modul bacaan digital
    │   │       │   ├── PendaftaranUkmPage.jsx # Formulir daftar UKM baru
    │   │       │   └── StudentDashboard.jsx
    │   │       └── admin/
    │   │           ├── AdminDashboard.jsx   # Panel kontrol Super Admin
    │   │           ├── UkmPage.jsx          # Kelola entitas UKM
    │   │           └── UsersPage.jsx        # Kelola pengguna sistem
    │   └── index.html
    │
    └── docs/
        ├── PRD.md            # Product Requirements Document
        ├── ARCHITECTURE.md   # Dokumen arsitektur teknis
        ├── ROADMAP.md        # Rencana kerja pengembangan berkelanjutan
        ├── GUIDELINES.md     # Standar penulisan kode & security
        └── REFERENCES.md     # Dokumen referensi & catatan teknis (File ini)
```

---

## 🗄️ Model Database (Entity-Relationship)

| Model | Field Utama | Relasi & Deskripsi |
|-------|-------------|--------------------|
| `User` | `id, nim, name, email, phone, role, password, avatar, isVerified, verificationStatus, verificationDocument` | Pengguna sistem (mahasiswa, manager, superadmin) |
| `Ukm` | `id, name, slug, description, vision, mission, logo, heroImage, managerId, isActive` | Profil 4 UKM binaan resmi STMIK Lombok |
| `UserUkm` | `userId, ukmId, roleInUkm, membershipStatus, joinedAt` | Junction table many-to-many keanggotaan mahasiswa di UKM |
| `Transaction` | `id, ukmId, userId, amount, type, category, description, date, proofReceipt, isCancelled, cancellationReason` | Buku kas transparan dengan soft cancellation trail |
| `Meeting` | `id, ukmId, meetingNumber, title, date, time, location, agenda, token, qrCode, isClosed` | Sesi pertemuan tatap muka / online UKM |
| `Attendance` | `id, userId, ukmId, meetingId, date, status, checkInTime, notes` | Catatan kehadiran presensi anggota per pertemuan |
| `LeaveRequest` | `id, userId, ukmId, meetingId, date, reason, attachment, status, reviewNotes, reviewedBy` | Surat pengajuan izin/sakit mahasiswa |
| `Achievement` | `id, ukmId, title, category, description, year, imageUrl, fileUrl, fileSize, author` | Koleksi piala/prestasi, karya dokumentasi, dan arsip modul e-book |
| `Application` | `id, userId, ukmId, status, motivation, reviewNotes, reviewedBy` | Berkas pengajuan pendaftaran UKM oleh mahasiswa baru |
| `Dues` & `DuesPayment` | `id, ukmId, month, year, amount, status` | Tagihan dan bukti pembayaran iuran bulanan |
| `AuditLog` | `id, action, userId, details, ip, createdAt` | Riwayat jejak audit keamanan transaksi dan autentikasi |

### Tipe Transaksi (`type`)
- `income` → Pemasukan kas (iuran anggota, sponsorship, dana kampus)
- `expense` → Pengeluaran kas (kebutuhan logistik, konsumsi, transportasi)

### Kategori Transaksi (`category`)
- `iuran` — Pembayaran iuran rutin anggota
- `operasional` — Kebutuhan operasional sekretariat/organisasi
- `kegiatan` — Pembiayaan kepanitiaan atau program kerja
- `dana_hibah` — Dana bantuan kemahasiswaan dari kampus
- `lainnya` — Pos kas lainnya

---

## 🔐 Sistem Peran (Role Access Control)

| Role | Batas Akses | Akun Demo Contoh |
|------|-------------|------------------|
| `superadmin` | Akses penuh seluruh UKM, kelola user, verifikasi akun, audit log | `admin` / `admin123` |
| `manager` | Kelola keuangan kas, buat sesi pertemuan, buka presensi, review izin, unggah capaian UKM binaan | `manager_techcode` / `manager123` |
| `student` | Lihat transparansi keuangan kas, unduh rekap, check-in presensi mandiri, ajukan izin, daftar UKM | `220101001` / `password123` |

---

## 🌐 API Endpoints Utama

### Auth & Profil
- `POST /api/auth/register` — Pendaftaran akun mahasiswa baru (+ unggah KTM & apply UKM)
- `POST /api/auth/login` — Autentikasi login pengguna dengan anti brute-force
- `GET /api/profile` — Mengambil data profil user yang sedang login
- `PUT /api/profile` — Memperbarui profil, ganti password, avatar & dokumen verifikasi

### Unit Kegiatan Mahasiswa (UKM)
- `GET /api/ukm` — Daftar semua UKM aktif
- `GET /api/ukm/:id` — Detail profil lengkap UKM
- `GET /api/ukm/:id/stats` — Statistik ringkas keuangan kas UKM
- `GET /api/ukm/:id/members` — Daftar anggota resmi & struktur pengurus
- `GET /api/ukm/:id/achievements` — Galeri prestasi, karya dokumentasi & e-book modul
- `POST /api/ukm/:id/achievements` — Tambah arsip prestasi / e-book baru (khusus manajer)
- `PUT /api/ukm/:id/achievements/:id` — Perbarui data capaian / e-book
- `DELETE /api/ukm/:id/achievements/:id` — Hapus capaian / e-book

### Transaksi Keuangan Kas
- `GET /api/transactions/:ukmId` — Seluruh riwayat transaksi buku kas
- `GET /api/transactions/:ukmId/monthly` — Agregasi kas bulanan (Pemasukan vs Pengeluaran untuk Recharts)
- `POST /api/transactions/:ukmId` — Catat transaksi kas baru (manajer & superadmin)
- `PUT /api/transactions/:ukmId/:id` — Sunting rincian transaksi kas
- `DELETE /api/transactions/:ukmId/:id` — Pembatalan transaksi kas (*soft cancellation* dengan catatan alasan)

### Absensi & Pertemuan
- `GET /api/attendance/:ukmId/meetings` — Daftar sesi pertemuan kegiatan
- `POST /api/attendance/:ukmId/meetings` — Buat sesi pertemuan baru (+ generate token & QR)
- `GET /api/attendance/:ukmId/meetings/:meetingId/roster` — Lembar daftar hadir presensi per pertemuan
- `POST /api/attendance/:ukmId/meetings/:meetingId/roster` — Simpan presensi roster manual oleh pengurus
- `POST /api/attendance/:ukmId/check-in` — Check-in mandiri mahasiswa menggunakan token / scan kode sesi
- `GET /api/attendance/:ukmId/leave-requests` — Daftar permohonan surat izin/sakit
- `POST /api/attendance/:ukmId/leave-requests` — Ajukan surat izin kehadiran oleh mahasiswa
- `PUT /api/attendance/:ukmId/leave-requests/:id/review` — Persetujuan/penolakan surat izin oleh manajer
- `GET /api/attendance/:ukmId/student-overview` — Rekapitulasi absensi personal mahasiswa

### Pendaftaran Anggota (Applications)
- `GET /api/applications/:ukmId` — Daftar permohonan mahasiswa bergabung ke UKM
- `POST /api/applications` — Submit formulir pendaftaran UKM oleh mahasiswa
- `PUT /api/applications/:id/review` — Keputusan manajer (terima / tolak calon anggota)

---

## 💡 Catatan Teknis Penting

### CSS Class Prefix `.pro-*`
Semua class khusus dashboard keuangan menggunakan prefix `.pro-` untuk membedakannya dari class umum aplikasi. Ini memudahkan maintenance dan menghindari konflik style.

### `formatShortRupiah(val)` — Fungsi Format Rupiah Pendek
```js
const formatShortRupiah = val => {
  const n = Math.abs(Number(val) || 0);
  const prefix = Number(val) < 0 ? '-' : '';
  if (n >= 1000000) return prefix + 'Rp ' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return prefix + 'Rp ' + Math.round(n / 1000) + 'k';
  return prefix + 'Rp ' + n.toLocaleString('id-ID');
};
```
> **Penting:** Gunakan fungsi ini untuk tampilan di bubble stats dan sparkline card.
> Jangan gunakan `fmt()` biasa karena akan menghasilkan `Rp NaN` jika diberi string atau bernilai null.

### Multi-UKM Sparkline Strip
Untuk menampilkan grafik mini per manajer UKM:
1. Fetch semua UKM + data bulanan via `Promise.all`
2. Simpan di state `allUkmData: { [ukmId]: { monthly, stats, transactions } }`
3. Render `BarChart` mini (5 bulan terakhir, tinggi 44px) per kartu UKM
4. Klik kartu → ubah `activeId` → sistem otomatis memuat grafik utama dan buku kas UKM terpilih

### Soft Cancellation Kas (Audit Trail Compliance)
Sesuai standar audit LPJ universitas:
- Transaksi kas tidak dihapus permanen (`hard delete`) dari basis data.
- Menjalankan *soft cancellation* dengan mengeset `isCancelled: true` dan menyertakan `cancellationReason`.
- Transaksi yang dibatalkan tetap tercatat di log audit dan dapat ditinjau oleh Super Admin / BEM.

---

## 📌 URL Development

| URL | Keterangan |
|-----|------------|
| `http://localhost:5173` | Frontend (Vite dev server) |
| `http://localhost:5000` | Backend (Express API server) |
| `http://localhost:5173/login` | Halaman autentikasi login |
| `http://localhost:5173/register` | Pendaftaran akun mahasiswa & upload KTM |
| `http://localhost:5173/manager/kas` | Dashboard keuangan kas manajer |
| `http://localhost:5173/student/kas` | Transparansi kas mahasiswa |
| `http://localhost:5173/manager/absen` | Kelola pertemuan & token presensi |
| `http://localhost:5173/student/absen` | Check-in mandiri & submit izin |
| `http://localhost:5173/admin` | Panel kontrol Super Admin |

---

## 📖 Dokumentasi Eksternal

- [React Documentation](https://react.dev)
- [Recharts Documentation](https://recharts.org/en-US/)
- [Vite Documentation](https://vitejs.dev)
- [Sequelize ORM Docs](https://sequelize.org)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Plus Jakarta Sans (Google Fonts)](https://fonts.google.com/specimen/Plus+Jakarta+Sans)

---

*Terakhir diperbarui: Oktober 2026 | SIMKAS – STMIK Lombok*
