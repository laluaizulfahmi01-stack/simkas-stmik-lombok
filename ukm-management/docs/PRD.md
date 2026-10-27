# PRD Sistem Informasi Manajemen UKM Kampus
**Versi 0.1 (Draf untuk validasi) · STMIK Lombok · Disusun bersama pemilik proyek**

> **Cara membaca dokumen ini:** Setiap butir diberi label status:
> - **[K]**: Keputusan pemilik proyek (Final & Mengikat).
> - **[R]**: Rekomendasi AI yang belum disetujui.
> - **[T]**: Keputusan terbuka yang perlu dijawab sebelum ERD final.

---

## 1. Informasi Proyek

| Item | Isi |
|---|---|
| **Nama Sistem** | Sistem Informasi Manajemen UKM Kampus (SIMKAS) |
| **Institusi** | STMIK Lombok |
| **Platform** | Aplikasi Web (Mobile-Responsive) |
| **Skala Awal [K]** | 5 UKM, target awal < 100 mahasiswa |
| **Tim** | 2 orang, pengembangan dengan bantuan AI (*vibe coding*) |
| **Teknologi** | Frontend: React (Vite) + Vanilla CSS Modern<br>Backend: Node.js (Express) + Sequelize ORM<br>Database: SQLite (Lokal) / Supabase PostgreSQL |
| **Penggunaan** | **Penggunaan nyata**, bukan sekadar tugas kuliah |

---

## 2. Latar Belakang dan Masalah
Setiap UKM mengelola anggota, kas, agenda, absensi, dan dokumentasinya sendiri-sendiri, biasanya lewat chat, kertas, atau berkas terpisah. Akibatnya data tersebar, riwayat mudah hilang saat pengurus berganti, keuangan sulit ditelusuri, dan mahasiswa kesulitan mencari informasi UKM serta mendaftar.

### Masalah Utama yang Ingin Diselesaikan:
1. Pendaftaran dan keanggotaan UKM tidak terdata rapi dan tidak ada riwayatnya.
2. Keuangan dan iuran tidak transparan dan rawan salah hitung.
3. Absensi dan agenda tidak terdokumentasi terpusat.
4. Informasi dan sejarah UKM tidak mudah diakses publik.
5. Tidak ada pengawasan terpusat, sementara data internal tiap UKM harus tetap terpisah.

---

## 3. Tujuan Sistem
- **G-01**: Menyatukan pengelolaan semua UKM dalam satu sistem dengan data internal yang terisolasi per UKM.
- **G-02**: Memisahkan dengan jelas akun, pendaftaran, keanggotaan, dan peran.
- **G-03**: Menyediakan pencatatan keuangan iuran dan kas yang transparan bagi anggota dan bebas penghitungan ganda.
- **G-04**: Mempermudah pencatatan absensi dan agenda kegiatan.
- **G-05**: Menjaga riwayat penting (keanggotaan, jabatan, keuangan, agenda) tanpa penghapusan permanen.
- **G-06**: Menyediakan informasi publik UKM bagi pengunjung dan mahasiswa.

---

## 4. Ruang Lingkup
**Termasuk V1:** Akun dan verifikasi KTM, manajemen UKM, jadwal pendaftaran, pendaftaran dan seleksi, keanggotaan, peran jabatan, agenda kegiatan, absensi, keuangan (kewajiban iuran, pembayaran iuran, kas pemasukan & pengeluaran, laporan kas), publikasi konten, dokumen internal, inventaris sederhana, riwayat perubahan penting (*audit log*).

**Ditunda / Tidak Termasuk V1 (Lihat Bagian 12):** Portofolio mahasiswa (V2), Check-in mandiri kode/QR, Pembayaran iuran online gateway, Cicilan iuran, Aplikasi seluler asli.

---

## 5. Jenis Pengguna dan Hak Akses (RBAC)

### 5.1 Jenis Pengguna
| Pengguna | Deskripsi |
|---|---|
| **Pengunjung** | Belum login. Hanya melihat konten publik, katalog UKM, profil, agenda publik, dan berita. |
| **Mahasiswa** | Punya akun. Mengelola profil dan mendaftar UKM. **Akun belum terverifikasi hanya dapat melihat informasi publik dan tidak dapat mengajukan pendaftaran UKM [K].** |
| **Anggota** | Mahasiswa dengan keanggotaan aktif di suatu UKM. Hak akses hanya pada UKM tempatnya menjadi anggota. |
| **Pengurus** | Anggota dengan jabatan struktural di UKM: **Pengelola, Bendahara, Sekretaris, Publikasi [K]**. |
| **Super Admin** | Mengawasi seluruh sistem, mengelola UKM global, dan menunjuk Pengelola UKM. |

### 5.2 Prinsip Peran
- **RB-01 [K]**: Peran melekat pada konteks UKM, bukan pada akun. Seseorang dapat menjadi anggota di UKM A dan pengurus di UKM B.
- **RB-02 [K]**: Satu orang boleh merangkap beberapa jabatan dalam satu UKM. Setiap jabatan diberikan dan dicabut secara terpisah.
- **RB-03 [K]**: Jabatan dicatat dengan tanggal mulai (*start_date*) dan selesai (*end_date*), sehingga riwayat kepengurusan tetap ada tanpa konsep periode tahunan kaku.
- **RB-04 [K]**: Super Admin membuat UKM dan menunjuk Pengelola. Pengelola mengangkat Bendahara, Sekretaris, dan Publikasi dari anggota UKM-nya.
- **RB-05**: Pemeriksaan hak akses wajib dilakukan di sisi server.

### 5.3 Matriks Hak Akses (Ringkas)
| Fungsi | Pengunjung | Mahasiswa | Anggota | Bendahara | Sekretaris | Publikasi | Pengelola | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Lihat konten publik & profil UKM | Ya | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Mengajukan pendaftaran UKM | - | Ya (Verified) | - | - | - | - | - | - |
| Lihat dokumen & agenda internal | - | - | Lihat | Lihat | Lihat | Lihat | Kelola | Kelola |
| Lihat rincian kas & status iuran | - | - | Lihat | Kelola | Lihat | Lihat | Kelola | Lihat |
| Kelola kas dan iuran UKM | - | - | - | Ya | - | - | Ya | Ya |
| Kelola absensi pertemuan | - | - | Lihat pribadi | - | Ya | - | Ya | Ya |
| Kelola konten publik & dokumentasi | - | - | - | - | - | Ya | Ya | Ya |
| Kelola agenda kegiatan | - | - | Lihat | [R] Ya | [R] Ya | [R] Ya | Ya | Ya |
| Proses pendaftaran & anggota | - | - | - | - | - | - | Ya | Ya |
| Angkat / cabut jabatan pengurus | - | - | - | - | - | - | Ya | Ya |
| Verifikasi akun KTM mahasiswa | - | - | - | - | - | - | Ya | Ya |
| Buat UKM dan kelola sistem global | - | - | - | - | - | - | - | Ya |

---

## 6. Kebutuhan Fungsional (Prioritas: M = Wajib V1, S = Sebaiknya V1, C = Tunda)

### 6.1 Akun dan Verifikasi (AKN)
- **FR-AKN-01 (M)**: Mahasiswa mendaftar akun dengan NIM, nama, program studi, dan kata sandi.
- **FR-AKN-02 (M)**: Login menggunakan NIM dan kata sandi.
- **FR-AKN-03 (M)**: NIM unik: satu NIM hanya untuk satu akun.
- **FR-AKN-04 (M)**: Mahasiswa mengunggah foto KTM untuk verifikasi identitas [K].
- **FR-AKN-05 (M)**: Super Admin atau Pengelola UKM mana pun dapat memverifikasi akun (sekali per akun). Sistem mencatat pemverifikasi dan waktunya [K].
- **FR-AKN-06 (M)**: **Foto KTM dihapus setelah verifikasi.** Hanya status, pemverifikasi, dan waktu yang disimpan [K].
- **FR-AKN-07 (M)**: Akun memiliki status: `aktif`, `lulus`, `nonaktif`. Akun **tidak pernah dihapus permanen** [K].
- **FR-AKN-08 (M)**: Pengguna dapat mengubah kata sandi dan data profil dasar.
- **FR-AKN-09 (S)**: Pemulihan kata sandi lupa [T-04].

### 6.2 Manajemen UKM dan Jabatan (UKM)
- **FR-UKM-01 (M)**: Super Admin membuat, mengubah, dan menonaktifkan UKM. UKM tidak dihapus permanen.
- **FR-UKM-02 (M)**: Super Admin menunjuk Pengelola UKM.
- **FR-UKM-03 (M)**: Pengelola mengangkat dan mencabut Bendahara, Sekretaris, Publikasi dari anggota UKM-nya.
- **FR-UKM-04 (M)**: Riwayat jabatan (siapa, jabatan apa, mulai, selesai) tersimpan.
- **FR-UKM-05 (M)**: Profil UKM (nama, deskripsi, kontak, logo) dapat dikelola.

### 6.3 Pendaftaran dan Seleksi (PND)
- **FR-PND-01 (M)**: Pengelola menetapkan jadwal pendaftaran (tanggal buka dan tutup) untuk UKM-nya. Super Admin dapat mengubahnya [K].
- **FR-PND-02 (M)**: Mahasiswa mengajukan pendaftaran hanya dalam jadwal terbuka.
- **FR-PND-03 (M)**: **Sistem menolak pendaftaran jika mahasiswa sudah memiliki 2 pendaftaran berstatus diajukan, dalam seleksi, atau diterima [K].**
- **FR-PND-04 (M)**: Status pendaftaran: `diajukan`, `dalam_seleksi`, `diterima`, `ditolak`, `dibatalkan`. Pengelola dapat memberi catatan. Detail seleksi dilakukan di luar sistem [K].
- **FR-PND-05 (M)**: Mahasiswa dapat membatalkan pendaftarannya sendiri.
- **FR-PND-06 (M)**: Pengelola tidak melakukan verifikasi identitas per pendaftaran. Syarat mahasiswa dianggap terpenuhi bila akun terverifikasi. Akun yang belum terverifikasi tidak dapat mengajukan pendaftaran UKM [K].
- **FR-PND-07 (M)**: Pendaftaran yang diterima membentuk keanggotaan secara otomatis.

### 6.4 Keanggotaan (MBR)
- **FR-MBR-01 (M)**: Daftar anggota per UKM dengan status keanggotaan.
- **FR-MBR-02 (M)**: Anggota dapat mengundurkan diri. Pengelola dapat mengeluarkan anggota. Keduanya mencatat tanggal selesai dan alasan [K].
- **FR-MBR-03 (M)**: Riwayat keanggotaan tidak dihapus dan dapat ditelusuri.
- **FR-MBR-04 (M)**: Kuota 2 UKM kembali bila pendaftaran ditolak, dibatalkan, atau keanggotaan berakhir.
- **FR-MBR-05 (S)**: Perubahan status akun menjadi lulus atau nonaktif tidak otomatis mengakhiri keanggotaan. Super Admin mengubah status akun, dan Pengelola dapat mengakhiri keanggotaan aktif dengan alasan [K].

### 6.5 Agenda dan Kegiatan (AGD)
- **FR-AGD-01 (M)**: Membuat agenda dengan judul, deskripsi, tanggal, waktu, lokasi, dan visibilitas (`publik` atau `internal`).
- **FR-AGD-02 (M)**: Kalender kegiatan per UKM dan kalender publik.
- **FR-AGD-03 (M)**: Status kegiatan: `direncanakan`, `terlaksana`, `ditunda`, `dibatalkan`.
- **FR-AGD-04 (M)**: Perubahan jadwal dan status penting tercatat riwayatnya.
- **FR-AGD-05 (S)**: Pengingat kepada pengurus bila belum ada agenda untuk bulan berikutnya. Hanya anjuran, tidak memblokir [K].
- **FR-AGD-07 (S)**: Dokumentasi kegiatan (foto) ditautkan ke agenda.

### 6.6 Absensi (ABS)
- **FR-ABS-01 (M)**: Sekretaris atau pengurus berwenang membuat sesi absensi, terkait agenda atau berdiri sendiri.
- **FR-ABS-02 (M)**: Pengurus berwenang menginput kehadiran seluruh anggota dengan status: `hadir`, `izin`, `sakit`, `alpa` [K].
- **FR-ABS-03 (M)**: Satu anggota hanya punya satu catatan per sesi.
- **FR-ABS-04 (M)**: Koreksi absensi oleh pengguna berwenang dengan jejak perubahan.
- **FR-ABS-05 (M)**: Anggota melihat riwayat absensi pribadi.
- **FR-ABS-06 (M)**: Rekap kehadiran per sesi/kegiatan dan per anggota.
- **FR-ABS-07 (C)**: Check-in mandiri oleh anggota (kode/QR) [ditunda].

### 6.7 Keuangan (KEU)
- **FR-KEU-01 (M)**: Bendahara atau Pengelola membuat kewajiban iuran (`dues`): nama iuran, jatuh tempo, dan anggota yang dikenai. Nominal dapat berbeda per UKM dan per anggota [K].
- **FR-KEU-02 (M)**: Pencatatan pembayaran cukup dengan mencari nama anggota lalu mengisi jumlah dibayar [K].
- **FR-KEU-03 (M)**: Status iuran hanya `lunas` atau `belum lunas`. Tanpa cicilan [K].
- **FR-KEU-04 (M)**: Pencatatan pemasukan non-iuran dan pengeluaran kas dengan rincian dan tanggal [K].
- **FR-KEU-05 (M)**: Bukti transaksi dapat dilampirkan pada pembayaran, pemasukan, dan pengeluaran.
- **FR-KEU-06 (M)**: Saldo kas dihitung dari transaksi kas. Riwayat transaksi tersedia.
- **FR-KEU-07 (M)**: Laporan keuangan kas berdasarkan rentang tanggal (Format LPJ).
- **FR-KEU-08 (M)**: Rekap status iuran seluruh anggota.
- **FR-KEU-09 (M)**: Seluruh anggota UKM dapat melihat rincian keuangan UKM-nya, termasuk status iuran anggota lain, sebagai pelihat saja [K].
- **FR-KEU-10 (M)**: Koreksi atau pembatalan transaksi tidak menghapus data, melainkan tercatat sebagai perubahan/pembatalan dengan jejak.

### 6.8 Publikasi, Sejarah, dan Dokumentasi (PUB)
- **FR-PUB-01 (M)**: Peran Publikasi mengelola konten publik: profil, sejarah, foto kegiatan, prestasi.
- **FR-PUB-02 (M)**: Konten publik langsung tayang saat diunggah, tanpa persetujuan [K].
- **FR-PUB-03 (M)**: Konten dapat ditarik dari tayang tanpa dihapus permanen [K].
- **FR-PUB-04 (M)**: Setiap perubahan konten mencatat siapa dan kapan [K].
- **FR-PUB-05 (M)**: Halaman publik dapat diakses pengunjung tanpa login.
- **FR-PUB-06 (S)**: Arsip kepengurusan ditampilkan dari riwayat jabatan.

### 6.9 Dokumen Internal (DOK)
- **FR-DOK-01 (M)**: Pengurus yang berwenang mengunggah dokumen organisasi dan dokumentasi internal.
- **FR-DOK-02 (M)**: Semua anggota resmi UKM tersebut dapat melihat dokumen internal sebagai pelihat saja, tanpa hak mengubah [K].
- **FR-DOK-03 (M)**: Dokumen internal tidak dapat diakses oleh non-anggota UKM tersebut, termasuk lewat tautan langsung.

### 6.10 Inventaris Sederhana (INV)
- **FR-INV-01 (M)**: Mencatat barang: nama, jumlah, kondisi (`baik`, `rusak_ringan`, `rusak_berat`), catatan, milik satu UKM [K].
- **FR-INV-02 (S)**: Perubahan data barang tercatat siapa dan kapan.
- **FR-INV-03 (M)**: Siapa yang boleh mengelola inventaris: Pengelola dan Sekretaris.

### 6.11 Jejak Audit (AUD)
- **FR-AUD-01 (M)**: Perubahan penting dicatat: status keanggotaan, jabatan, transaksi keuangan, absensi (koreksi), agenda (jadwal dan status), konten publik, verifikasi akun.
- **FR-AUD-02 (S)**: Super Admin dapat melihat jejak audit seluruh sistem. Pengelola dapat melihat jejak UKM-nya [R].

---

## 7. Kebutuhan Nonfungsional (NFR)
- **NFR-01**: Hak akses diperiksa di sisi server pada setiap permintaan (*server-side enforcement*).
- **NFR-02**: Isolasi data per UKM: pengguna tidak dapat membaca/mengubah data internal UKM lain.
- **NFR-03**: Kata sandi disimpan dalam bentuk hash yang kuat (`bcryptjs`).
- **NFR-04**: Sesi login aman dengan proteksi rate limiter & brute-force prevention.
- **NFR-05**: File internal (bukti kas, dokumen) disimpan privat dan hanya dapat diakses pengguna berwenang.
- **NFR-06**: Foto KTM dihapus permanen setelah verifikasi akun selesai.
- **NFR-07**: Tidak ada penghapusan permanen (*soft delete/status update*) pada data keanggotaan, jabatan, keuangan, agenda, dan absensi.
- **NFR-08**: Pembatasan ukuran file unggahan (maksimal 5-10 MB).
- **NFR-09**: Tampilan responsif, nyaman di layar smartphone maupun desktop.
- **NFR-10**: Antarmuka berbahasa Indonesia ramah pengguna kampus.
- **NFR-12**: Skala target: 5 UKM, kurang dari 100 mahasiswa.
- **NFR-13**: Zona waktu Indonesia Tengah (WITA, UTC+8) untuk seluruh pencatatan jadwal dan kegiatan.

---

## 8. Ringkasan 25 Keputusan Pemilik Proyek [K]
1. **K1**: Verifikasi NIM manual lewat foto KTM.
2. **K2/K7**: Kuota maksimal 2 pendaftaran terhitung per mahasiswa.
3. **K3**: Super Admin membuat UKM & tunjuk Pengelola. Pengelola mengangkat Bendahara, Sekretaris, Publikasi.
4. **K4**: Pembayaran iuran di luar sistem (transfer/tunai), aturan nominal iuran fleksibel per UKM.
5. **K5**: Tanpa konsep periode tahunan kaku, menggunakan tanggal mulai & selesai pada jabatan.
6. **K6/K15**: Verifikasi sekali per akun oleh Super Admin atau Pengelola; foto KTM langsung dihapus.
7. **K8**: Alur seleksi status sederhana (`diajukan` → `dalam_seleksi` → `diterima` / `ditolak`).
8. **K9**: Iuran dengan cari nama, jumlah, jatuh tempo, status `lunas` / `belum lunas`.
9. **K10**: Absensi diinput oleh pengurus UKM.
10. **K11/K16**: Jadwal pendaftaran dibuka/ditutup per UKM.
11. **K12**: Publikasi konten langsung tayang tanpa persetujuan bertingkat.
12. **K13**: Akun tidak dihapus; keanggotaan diakhiri dengan mencatat tanggal selesai dan alasan.
13. **K14**: Skala awal 5 UKM dan < 100 mahasiswa.
14. **K17**: Portofolio mahasiswa ditunda ke V2; modul inventaris sederhana masuk ke V1.
15. **K18**: Keuangan kas & status iuran transparan bagi seluruh anggota UKM.
16. **K19**: Pengingat agenda bulan depan bersifat anjuran, tidak memblokir.
17. **K20**: Satu mahasiswa boleh merangkap beberapa jabatan dalam UKM.
18. **K21**: Dokumen internal dapat dilihat semua anggota tanpa hak ubah.
19. **K22**: Teknologi fleksibel menyesuaikan kebutuhan fungsional.
20. **K23**: Akun belum terverifikasi KTM dilarang mengajukan pendaftaran UKM.
21. **K24**: Pengelola memiliki wewenang mengelola/mengubah keuangan UKM-nya.
22. **K25**: Status akun lulus/nonaktif tidak otomatis mengakhiri keanggotaan UKM; Super Admin mengubah status akun, Pengelola mengakhiri keanggotaan dengan alasan.
