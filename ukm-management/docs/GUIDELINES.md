# SIMKAS - Standard Operating Procedure & Contribution Guide

---

## 1. Lingkungan Pengembangan Lokal (Local Environment Setup)

### A. Persiapan Backend
```bash
# Pindah ke direktori backend
cd backend

# Salin konfigurasi environment
cp .env.example .env

# Pasang dependensi
npm install

# Isi data awal 4 UKM & Akun Default
node seed.js

# Jalankan server API (Port 5000)
npm run dev
```

### B. Persiapan Frontend
```bash
# Pindah ke direktori frontend
cd frontend

# Pasang dependensi
npm install

# Jalankan server frontend Vite (Port 5173)
npm run dev
```

---

## 2. Standar Desain UI/UX & Komponen
- Gunakan font standar proyek: **Plus Jakarta Sans** & **Inter**.
- Selalu manfaatkan CSS Variables yang sudah didefinisikan pada [index.css](file:///d:/Desktop/SIMKAS/ukm-management/frontend/src/index.css) (misal: `var(--primary)`, `var(--bg-base)`, `var(--radius-lg)`).
- Buat komponen modular di folder `src/components/` agar kode tidak menumpuk dalam satu file.
- Pastikan tampilan ramah pengguna ponsel (responsif mobile dengan padding yang proporsional).

---

## 3. Akun Default Pengujian (Demo Accounts)

Sistem login SIMKAS mendukung autentikasi menggunakan **NIM** atau username resmi:

| Role | NIM Login | Password | Keterangan |
|---|---|---|---|
| **Super Admin** | `admin` | `admin123` | Akses penuh seluruh sistem & konfigurasi UKM |
| **Manager Techcode** | `manager_techcode` | `manager123` | Pengelola kas & absensi UKM Techcode |
| **Manager Gumpala** | `manager_gumpala` | `manager123` | Pengelola kas & absensi UKM Gumpala |
| **Manager Haluner** | `manager_haluner` | `manager123` | Pengelola kas & absensi UKM Haluner |
| **Manager Ceria** | `manager_ceria` | `manager123` | Pengelola kas & absensi UKM Ceria |
| **Mahasiswa Demo** | `220101001` | `password123` | Anggota UKM Techcode & Ceria |
