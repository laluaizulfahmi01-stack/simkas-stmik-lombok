# 📚 REFERENSI PROYEK SIMKAS

> Dokumen ini menampung seluruh referensi desain, teknologi, komponen UI, dan sumber inspirasi yang digunakan dalam pengembangan **SIMKAS – Sistem Informasi UKM STMIK Lombok**.

---

## 🎨 Referensi Desain UI/UX

### 1. Influency Dashboard (Referensi Utama Halaman Kas)
- **Deskripsi:** Dashboard keuangan modern bergaya premium dengan stat cards, dual bar chart, dan overlapping bubble stats.
- **Elemen yang Diadopsi:**
  - 4 top stat cards (Lime Hero Card + 3 kartu reguler)
  - Dual rounded bar chart (65/35 split layout)
  - Overlapping bubble circles untuk distribusi dana
  - Progress bar target
  - Mini sparkline chart per entitas
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

### 2. Referensi Warna & Tema

| Token CSS | Nilai | Keterangan |
|-----------|-------|------------|
| `--bg-base` | `#ffffff` / `#0f172a` | Background utama (light/dark) |
| `--bg-subtle` | `#f8fafc` / `#1e293b` | Background sekunder |
| `--border` | `#e2e8f0` / `#334155` | Garis batas |
| `--text-primary` | `#0f172a` / `#f1f5f9` | Teks utama |
| `--text-secondary` | `#475569` / `#94a3b8` | Teks sekunder |
| `--text-muted` | `#94a3b8` / `#64748b` | Teks muted |
| `--primary` | `#3b82f6` | Warna aksen utama (biru) |
| Lime Hero | `#ccf726` | Warna kartu hero dashboard |

---

### 3. Font & Tipografi
- **Font Utama:** `Inter` (Google Fonts) — diimpor di `index.css`
- **Alternatif:** `system-ui`, `sans-serif`
- **Font Weight:** 400 (normal), 600 (semibold), 700 (bold), 800 (extrabold)

---

## 🧩 Library yang Digunakan

### Frontend

| Library | Versi | Kegunaan |
|---------|-------|----------|
| **React** | ^18.x | Framework UI utama |
| **Vite** | ^8.x | Build tool & dev server |
| **React Router DOM** | ^6.x | Client-side routing |
| **Recharts** | ^2.x | Grafik bar chart, sparkline |
| **React Icons (MD)** | ^5.x | Ikon Material Design |
| **Axios** | ^1.x | HTTP client API |

### Backend

| Library | Versi | Kegunaan |
|---------|-------|----------|
| **Node.js** | 20.x | Runtime server |
| **Express.js** | ^4.x | Web framework |
| **Sequelize** | ^6.x | ORM database |
| **SQLite3** | ^5.x | Database lokal |
| **JWT** | ^9.x | Autentikasi token |
| **bcrypt** | ^5.x | Enkripsi password |
| **CORS** | ^2.x | Cross-origin request |

---

## 📁 Struktur Folder Proyek

```
SIMKAS/
└── ukm-management/
    ├── backend/
    │   ├── src/
    │   │   ├── index.js          # Entry point server
    │   │   ├── models/           # Sequelize models
    │   │   ├── routes/           # API endpoints
    │   │   └── middleware/       # Auth middleware
    │   ├── seed.js               # Data seed 6-bulan
    │   └── database.sqlite       # Database lokal
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── main.jsx          # Entry point React
    │   │   ├── App.jsx           # Router utama
    │   │   ├── index.css         # Global styles (.pro-* prefix)
    │   │   ├── api.js            # Axios instance
    │   │   ├── context/
    │   │   │   └── AuthContext.jsx
    │   │   ├── components/
    │   │   │   ├── Sidebar.jsx
    │   │   │   └── ...
    │   │   └── pages/
    │   │       ├── manager/
    │   │       │   └── KasPage.jsx
    │   │       ├── student/
    │   │       │   └── KasPage.jsx
    │   │       └── admin/
    │   └── index.html
    │
    └── docs/
        ├── PRD.md
        ├── ARCHITECTURE.md
        ├── ROADMAP.md
        ├── GUIDELINES.md
        └── REFERENCES.md   ← File ini
```

---

## 🗄️ Model Database (ERD Singkat)

| Model | Field Penting | Relasi |
|-------|--------------|--------|
| `User` | `id, nim, name, role, password, ukmId` | belongsTo UKM |
| `UKM` | `id, name, description, managerId` | hasMany User, Transaction |
| `Transaction` | `id, ukmId, amount, type, category, description, date` | belongsTo UKM |
| `Attendance` | `id, userId, ukmId, date, status` | belongsTo User, UKM |
| `Application` | `id, userId, ukmId, status, message` | belongsTo User, UKM |
| `Due` | `id, userId, ukmId, amount, period, status` | belongsTo User, UKM |

### Tipe Transaksi (`type`)
- `income` → Pemasukan Kas
- `expense` → Pengeluaran Kas

### Kategori Transaksi (`category`)
- `iuran` — Iuran anggota rutin
- `operasional` — Biaya operasional UKM
- `kegiatan` — Dana kegiatan/event
- `dana_hibah` — Hibah/beasiswa dari kampus
- `lainnya` — Kategori bebas

---

## 🔐 Sistem Peran (Role)

| Role | Akses | Login Contoh |
|------|-------|-------------|
| `superadmin` | Semua fitur, semua UKM | `admin` / `admin123` |
| `manager` | Kelola kas & anggota UKM miliknya | `manager_techcode` / `manager123` |
| `student` | Lihat transparansi kas, absensi | `220101001` / `password123` |

---

## 🌐 API Endpoints Utama

### Auth
- `POST /api/auth/login` — Login pengguna

### UKM
- `GET /api/ukm` — Daftar semua UKM
- `GET /api/ukm/:id/stats` — Statistik keuangan UKM
- `GET /api/ukm/:id/members` — Daftar anggota

### Transaksi Kas
- `GET /api/transactions/:ukmId` — Semua transaksi
- `GET /api/transactions/:ukmId/monthly` — Data bulanan untuk chart
- `POST /api/transactions` — Tambah transaksi
- `PUT /api/transactions/:id` — Edit transaksi
- `DELETE /api/transactions/:id` — Hapus transaksi

### Absensi
- `GET /api/attendance/:ukmId` — Data absensi
- `POST /api/attendance` — Tambah absensi

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
> Jangan gunakan `fmt()` biasa karena akan menghasilkan `Rp NaN` jika diberi string.

### Multi-UKM Sparkline Strip
Untuk menampilkan grafik per manajer UKM, digunakan pattern berikut:
1. Fetch semua UKM + transaksi bulanan via `Promise.all`
2. Store di state `allUkmData: { [ukmId]: { monthly, stats, transactions } }`
3. Render `BarChart` mini (5 bulan terakhir, height 44px) per kartu UKM
4. Klik kartu → set `activeId` → re-render grafik utama + buku kas

---

## 📌 URL Development

| URL | Keterangan |
|-----|------------|
| `http://localhost:5173` | Frontend (Vite dev server) |
| `http://localhost:5000` | Backend (Express API) |
| `http://localhost:5173/login` | Halaman login |
| `http://localhost:5173/manager/kas` | Dashboard kas manajer |
| `http://localhost:5173/student/kas` | Transparansi kas mahasiswa |
| `http://localhost:5173/admin` | Panel super admin |

---

## 📖 Dokumentasi Eksternal

- [React Documentation](https://react.dev)
- [Recharts Documentation](https://recharts.org/en-US/)
- [Vite Documentation](https://vitejs.dev)
- [Sequelize ORM Docs](https://sequelize.org)
- [React Icons (MD)](https://react-icons.github.io/react-icons/icons?name=md)
- [Inter Font (Google Fonts)](https://fonts.google.com/specimen/Inter)

---

*Terakhir diperbarui: Oktober 2026 | SIMKAS – STMIK Lombok*
