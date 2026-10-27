// backend/seed.js - Seeder STMIK Lombok (4 UKM Resmi, Capaian, E-Book & Foto)
require('dotenv').config();
const { sequelize, User, Ukm, Transaction, Attendance, UserUkm, Achievement, Meeting, LeaveRequest, Application } = require('./models');

async function seed() {
  try {
    console.log('🔄 Menghubungkan & mereset database...');
    await sequelize.sync({ force: true });
    console.log('✅ Tabel database berhasil disinkronkan.');

    // 1. Super Admin
    console.log('👤 Membuat akun Super Admin...');
    await User.create({
      nim: 'admin',
      name: 'Super Admin STMIK Lombok',
      email: 'admin@stmiklombok.ac.id',
      prodi: 'Pusat Komputer & SIM',
      password: 'admin123',
      role: 'superadmin',
      isVerified: true,
      verificationStatus: 'verified',
      accountStatus: 'aktif',
    });

    // 2. 4 Pengelola UKM
    console.log('👤 Membuat 4 Pengelola UKM...');
    const mTech = await User.create({
      nim: 'manager_techcode',
      name: 'Rian Pratama, S.Kom',
      email: 'manager.techcode@stmiklombok.ac.id',
      prodi: 'Teknik Informatika',
      password: 'manager123',
      role: 'manager',
      isVerified: true,
      verificationStatus: 'verified',
      accountStatus: 'aktif',
    });

    const mGumpala = await User.create({
      nim: 'manager_gumpala',
      name: 'Bima Satria, S.Kom',
      email: 'manager.gumpala@stmiklombok.ac.id',
      prodi: 'Sistem Informasi',
      password: 'manager123',
      role: 'manager',
      isVerified: true,
      verificationStatus: 'verified',
      accountStatus: 'aktif',
    });

    const mHaluner = await User.create({
      nim: 'manager_haluner',
      name: 'Nadia Putri, S.Kom',
      email: 'manager.haluner@stmiklombok.ac.id',
      prodi: 'Komputerisasi Akuntansi',
      password: 'manager123',
      role: 'manager',
      isVerified: true,
      verificationStatus: 'verified',
      accountStatus: 'aktif',
    });

    const mCeria = await User.create({
      nim: 'manager_ceria',
      name: 'Dimas Wijaya, S.Kom',
      email: 'manager.ceria@stmiklombok.ac.id',
      prodi: 'Teknik Informatika',
      password: 'manager123',
      role: 'manager',
      isVerified: true,
      verificationStatus: 'verified',
      accountStatus: 'aktif',
    });

    // 3. 4 UKM Resmi STMIK Lombok
    console.log('🏛 Membuat 4 UKM STMIK Lombok...');
    const ukmTechcode = await Ukm.create({
      name: 'UKM Techcode',
      managerId: mTech.id,
      registrationOpen: true,
      registrationOpenDate: '2026-01-01',
      registrationCloseDate: '2026-12-31',
      description: 'Komunitas resmi mahasiswa STMIK Lombok yang mendalami dunia coding, rekayasa perangkat lunak, AI, dan teknologi digital masa depan.',
      history: 'UKM Techcode STMIK Lombok didirikan pada tahun 2017 oleh sekelompok mahasiswa perintis Teknik Informatika. Berawal dari kelompok belajar algoritma malam di lab komputer, Techcode berkembang pesat menjadi inkubator software developer, web designer, dan technopreneur terkemuka di Pulau Lombok.',
      vision: 'Menjadi wadah riset dan kreasi teknologi informasi mahasiswa STMIK Lombok yang kompetitif di tingkat nasional dan berdaya saing global.',
      mission: '1. Mengadakan bootcamp coding & workshop teknologi mutakhir secara berkala.\n2. Mengembangkan aplikasi nyata untuk kebutuhan kampus dan UMKM Nusa Tenggara Barat.\n3. Mewakili STMIK Lombok dalam ajang Hackathon dan kompetisi IT bergengsi.',
    });

    const ukmGumpala = await Ukm.create({
      name: 'UKM Gumpala',
      managerId: mGumpala.id,
      registrationOpen: true,
      registrationOpenDate: '2026-01-01',
      registrationCloseDate: '2026-12-31',
      description: 'Gunung & Mahasiswa Pencinta Alam STMIK Lombok. Wadah petualangan, konservasi lingkungan, survival, dan ekspedisi alam terbuka.',
      history: 'UKM Gumpala didirikan pada 15 April 2015 di bawah kaki Gunung Rinjani. Lahir dari kecintaan mahasiswa STMIK Lombok pada kelestarian alam nusantara, Gumpala secara konsisten menyelenggarakan operasi SAR sukarela, reboisasi hutan mangrove, dan ekspedisi gunung di berbagai pulau di Indonesia.',
      vision: 'Membentuk kader mahasiswa STMIK Lombok yang berjiwa tangguh, mandiri, peduli kelestarian alam dan lingkungan hidup.',
      mission: '1. Pendidikan dan latihan dasar navigasi darat, panjat tebing, dan survival.\n2. Kampanye aksi bersih gunung dan konservasi terumbu karang pesisir Lombok.\n3. Siaga bencana dan respon kemanusiaan bencana alam di NTB.',
    });

    const ukmHaluner = await Ukm.create({
      name: 'UKM Haluner',
      managerId: mHaluner.id,
      registrationOpen: true,
      registrationOpenDate: '2026-01-01',
      registrationCloseDate: '2026-12-31',
      description: 'Pusat kreativitas seni pertunjukan, paduan suara, musik akustik & band, tari tradisional Sasak, serta teater kampus STMIK Lombok.',
      history: 'UKM Haluner dibentuk pada tahun 2018 sebagai wadah apresiasi seni dan kebudayaan daerah. Nama Haluner melambangkan harmoni cipta, rasa, dan karsa generasi muda kampus. Haluner selalu menjadi pengisi utama panggung wisuda akbar dan perayaan dies natalis kampus.',
      vision: 'Mewujudkan mahasiswa STMIK Lombok yang berjiwa kreatif, berbudaya, dan mampu melestarikan seni kearifan lokal dalam nuansa modern.',
      mission: '1. Mengembangkan minat bakat bermusik, tari, dan seni teater mahasiswa.\n2. Menyelenggarakan festival seni dan konser mini tahunan kampus.\n3. Menjalin kolaborasi seni lintas kampus se-Nusa Tenggara Barat.',
    });

    const ukmCeria = await Ukm.create({
      name: 'UKM Ceria',
      managerId: mCeria.id,
      registrationOpen: true,
      registrationOpenDate: '2026-01-01',
      registrationCloseDate: '2026-12-31',
      description: 'Unit Kegiatan Mahasiswa Olahraga & Kebugaran: Futsal, Badminton, Bola Basket, serta divisi E-Sports Mobile Legends & PUBG Mobile.',
      history: 'UKM Ceria didirikan tahun 2016 dengan moto "Sehat, Kuat, Berprestasi, dan Penuh Ceria". Berawal dari turnamen futsal antar-kelas, kini UKM Ceria memiliki berbagai cabang olahraga prestasi yang aktif berlatih di GOR dan rutin menyabet piala kejuaraan pekan olahraga mahasiswa.',
      vision: 'Mencetak atlet-atlet mahasiswa STMIK Lombok yang bugar, bermental juara, dan menjunjung tinggi sportivitas serta kebersamaan.',
      mission: '1. Latihan rutin mingguan cabang olahraga futsal, badminton, dan e-sports.\n2. Mengadakan turnamen kampus tahunan "CERIA CUP".\n3. Membina delegasi kampus untuk pekan olahraga mahasiswa regional NTB.',
    });

    // 4. Mahasiswa Demo
    console.log('🎓 Membuat akun mahasiswa...');
    const mhs1 = await User.create({
      nim: '220101001',
      name: 'Ahmad Fauzi',
      email: 'mahasiswa@stmiklombok.ac.id',
      prodi: 'Teknik Informatika',
      password: 'password123',
      role: 'student',
      isVerified: true,
      verificationStatus: 'verified',
      accountStatus: 'aktif',
    });

    const mhs2 = await User.create({
      nim: '220101002',
      name: 'Siti Nurhaliza',
      email: 'siti@stmiklombok.ac.id',
      prodi: 'Sistem Informasi',
      password: 'password123',
      role: 'student',
      isVerified: true,
      verificationStatus: 'verified',
      accountStatus: 'aktif',
    });

    // Mahasiswa baru terverifikasi yang belum ikut UKM (siap mendaftar)
    const mhs3 = await User.create({
      nim: '220101003',
      name: 'Budi Pratama',
      prodi: 'Teknik Informatika',
      password: 'password123',
      role: 'student',
      isVerified: true,
      verificationStatus: 'verified',
      accountStatus: 'aktif',
    });

    // Mahasiswa baru menunggu verifikasi KTM
    const mhs4 = await User.create({
      nim: '220101004',
      name: 'Rina Anggraini',
      prodi: 'Sistem Informasi',
      password: 'password123',
      role: 'student',
      isVerified: false,
      verificationStatus: 'pending',
      verificationNote: 'Menunggu peninjauan foto KTM mahasiswa baru',
      accountStatus: 'aktif',
    });

    // 5. Relasi Mahasiswa ke UKM (Masing-masing memilih 2 UKM)
    console.log('🔗 Mendaftarkan mahasiswa ke 2 UKM...');
    await UserUkm.bulkCreate([
      { userId: mhs1.id, ukmId: ukmTechcode.id, membershipStatus: 'aktif', ukmRole: 'anggota' },
      { userId: mhs1.id, ukmId: ukmCeria.id, membershipStatus: 'aktif', ukmRole: 'anggota' },
      { userId: mhs2.id, ukmId: ukmGumpala.id, membershipStatus: 'aktif', ukmRole: 'anggota' },
      { userId: mhs2.id, ukmId: ukmHaluner.id, membershipStatus: 'aktif', ukmRole: 'anggota' },
    ]);

    // 6. Transaksi Kas Awal (Histori 6 Bulan untuk 4 UKM)
    console.log('💰 Membuat catatan kas histori 6 bulan untuk seluruh UKM...');
    await Transaction.bulkCreate([
      // ── Techcode (Mei s/d Oktober 2026) ──
      { ukmId: ukmTechcode.id, userId: mhs1.id, type: 'income', amount: 120000, category: 'iuran', description: 'Iuran Kas Anggota Batch Mei', date: '2026-05-10' },
      { ukmId: ukmTechcode.id, userId: mTech.id, type: 'expense', amount: 65000, category: 'operasional', description: 'Pembelian Kabel LAN & Switch Lab', date: '2026-05-22' },
      
      { ukmId: ukmTechcode.id, userId: mhs1.id, type: 'income', amount: 150000, category: 'iuran', description: 'Iuran Kas Anggota Batch Juni', date: '2026-06-12' },
      { ukmId: ukmTechcode.id, userId: mTech.id, type: 'expense', amount: 90000, category: 'kegiatan', description: 'Konsumsi Workshop Python Dasar', date: '2026-06-25' },

      { ukmId: ukmTechcode.id, userId: mhs1.id, type: 'income', amount: 180000, category: 'iuran', description: 'Iuran Kas Anggota Batch Juli', date: '2026-07-08' },
      { ukmId: ukmTechcode.id, userId: mTech.id, type: 'expense', amount: 110000, category: 'operasional', description: 'Biaya Lisensi Server Cloud Development', date: '2026-07-20' },

      { ukmId: ukmTechcode.id, userId: mhs1.id, type: 'income', amount: 200000, category: 'dana_hibah', description: 'Dana Hibah Kampus Kegiatan Tech-Camp', date: '2026-08-05' },
      { ukmId: ukmTechcode.id, userId: mTech.id, type: 'expense', amount: 140000, category: 'kegiatan', description: 'Sewa Tenda & Logistik Tech-Camp Sembalun', date: '2026-08-18' },

      { ukmId: ukmTechcode.id, userId: mhs1.id, type: 'income', amount: 175000, category: 'iuran', description: 'Iuran Kas Anggota Batch September', date: '2026-09-10' },
      { ukmId: ukmTechcode.id, userId: mTech.id, type: 'expense', amount: 85000, category: 'operasional', description: 'Pembelian Flashdisk Bootable & Toolset', date: '2026-09-22' },

      { ukmId: ukmTechcode.id, userId: mhs1.id, type: 'income', amount: 220000, category: 'iuran', description: 'Iuran Kas Anggota Batch Oktober - Ahmad Fauzi dkk', date: '2026-10-05' },
      { ukmId: ukmTechcode.id, userId: mTech.id, type: 'expense', amount: 95000, category: 'kegiatan', description: 'Beli Domain & Hosting Workshop Web Techcode', date: '2026-10-12' },

      // ── Gumpala (Pencinta Alam) ──
      { ukmId: ukmGumpala.id, userId: mhs2.id, type: 'income', amount: 140000, category: 'iuran', description: 'Iuran Kas Bulanan Mei', date: '2026-05-15' },
      { ukmId: ukmGumpala.id, userId: mGumpala.id, type: 'expense', amount: 80000, category: 'operasional', description: 'Perawatan Tali Kernmantle & Carabiner', date: '2026-05-28' },
      { ukmId: ukmGumpala.id, userId: mhs2.id, type: 'income', amount: 160000, category: 'iuran', description: 'Iuran Kas Bulanan Juni', date: '2026-06-14' },
      { ukmId: ukmGumpala.id, userId: mGumpala.id, type: 'expense', amount: 95000, category: 'operasional', description: 'Refill Tabung Gas Portabel & Nesting', date: '2026-06-26' },
      { ukmId: ukmGumpala.id, userId: mhs2.id, type: 'income', amount: 210000, category: 'dana_hibah', description: 'Bantuan Ekspedisi Rinjani Lestari', date: '2026-07-10' },
      { ukmId: ukmGumpala.id, userId: mGumpala.id, type: 'expense', amount: 160000, category: 'kegiatan', description: 'Logistik Survival & P3K Ekspedisi', date: '2026-07-22' },
      { ukmId: ukmGumpala.id, userId: mhs2.id, type: 'income', amount: 185000, category: 'iuran', description: 'Iuran Kas Bulanan Agustus', date: '2026-08-12' },
      { ukmId: ukmGumpala.id, userId: mGumpala.id, type: 'expense', amount: 120000, category: 'kegiatan', description: 'Bibit Pohon Bakau Aksi Konservasi Pesisir', date: '2026-08-25' },
      { ukmId: ukmGumpala.id, userId: mhs2.id, type: 'income', amount: 190000, category: 'iuran', description: 'Iuran Kas Bulanan September', date: '2026-09-11' },
      { ukmId: ukmGumpala.id, userId: mGumpala.id, type: 'expense', amount: 105000, category: 'operasional', description: 'Servis GPS Garmin & Peta Topografi', date: '2026-09-24' },
      { ukmId: ukmGumpala.id, userId: mhs2.id, type: 'income', amount: 240000, category: 'iuran', description: 'Iuran Kas Bulanan Oktober - Siti Nurhaliza dkk', date: '2026-10-06' },
      { ukmId: ukmGumpala.id, userId: mGumpala.id, type: 'expense', amount: 115000, category: 'kegiatan', description: 'Pelatihan Navigasi Darat Dasar Anggota Baru', date: '2026-10-18' },

      // ── Haluner (Seni & Teater) ──
      { ukmId: ukmHaluner.id, userId: mhs2.id, type: 'income', amount: 110000, category: 'iuran', description: 'Iuran Kas Bulanan Mei', date: '2026-05-18' },
      { ukmId: ukmHaluner.id, userId: mHaluner.id, type: 'expense', amount: 60000, category: 'operasional', description: 'Pembelian Senar Gitar Akustik & Drumstick', date: '2026-05-30' },
      { ukmId: ukmHaluner.id, userId: mhs2.id, type: 'income', amount: 135000, category: 'iuran', description: 'Iuran Kas Bulanan Juni', date: '2026-06-15' },
      { ukmId: ukmHaluner.id, userId: mHaluner.id, type: 'expense', amount: 80000, category: 'operasional', description: 'Make Up & Properti Panggung Pentas Teater', date: '2026-06-27' },
      { ukmId: ukmHaluner.id, userId: mhs2.id, type: 'income', amount: 250000, category: 'sponsorship', description: 'Honor Penampilan Musik Akustik Dies Natalis', date: '2026-07-15' },
      { ukmId: ukmHaluner.id, userId: mHaluner.id, type: 'expense', amount: 140000, category: 'kegiatan', description: 'Kostum Tari Tradisional Sasak', date: '2026-07-28' },
      { ukmId: ukmHaluner.id, userId: mhs2.id, type: 'income', amount: 170000, category: 'iuran', description: 'Iuran Kas Bulanan Agustus', date: '2026-08-16' },
      { ukmId: ukmHaluner.id, userId: mHaluner.id, type: 'expense', amount: 95000, category: 'operasional', description: 'Maintenance Sound System & Mic Wireless', date: '2026-08-29' },
      { ukmId: ukmHaluner.id, userId: mhs2.id, type: 'income', amount: 165000, category: 'iuran', description: 'Iuran Kas Bulanan September', date: '2026-09-14' },
      { ukmId: ukmHaluner.id, userId: mHaluner.id, type: 'expense', amount: 90000, category: 'kegiatan', description: 'Cetak Buku Naskah Drama & Bunga Rampai', date: '2026-09-26' },
      { ukmId: ukmHaluner.id, userId: mhs2.id, type: 'income', amount: 210000, category: 'iuran', description: 'Iuran Kas Bulanan Oktober', date: '2026-10-09' },
      { ukmId: ukmHaluner.id, userId: mHaluner.id, type: 'expense', amount: 100000, category: 'operasional', description: 'Sewa Ruang Latihan Musik Studio', date: '2026-10-21' },

      // ── Ceria (Olahraga & E-Sports) ──
      { ukmId: ukmCeria.id, userId: mhs1.id, type: 'income', amount: 130000, category: 'iuran', description: 'Iuran Kas Bulanan Mei', date: '2026-05-12' },
      { ukmId: ukmCeria.id, userId: mCeria.id, type: 'expense', amount: 75000, category: 'operasional', description: 'Pembelian Bola Futsal Molten & Pompa', date: '2026-05-24' },
      { ukmId: ukmCeria.id, userId: mhs1.id, type: 'income', amount: 160000, category: 'iuran', description: 'Iuran Kas Bulanan Juni', date: '2026-06-11' },
      { ukmId: ukmCeria.id, userId: mCeria.id, type: 'expense', amount: 90000, category: 'operasional', description: 'Sewa Lapangan Futsal Latihan Rutin', date: '2026-06-25' },
      { ukmId: ukmCeria.id, userId: mhs1.id, type: 'income', amount: 220000, category: 'dana_hibah', description: 'Pendaftaran Delegasi Turnamen E-Sports NTB', date: '2026-07-09' },
      { ukmId: ukmCeria.id, userId: mCeria.id, type: 'expense', amount: 135000, category: 'kegiatan', description: 'Jersey Tim & Konsumsi Atlet Turnamen', date: '2026-07-21' },
      { ukmId: ukmCeria.id, userId: mhs1.id, type: 'income', amount: 180000, category: 'iuran', description: 'Iuran Kas Bulanan Agustus', date: '2026-08-14' },
      { ukmId: ukmCeria.id, userId: mCeria.id, type: 'expense', amount: 110000, category: 'operasional', description: 'Pembelian Raket Badminton & Kok Yonex', date: '2026-08-26' },
      { ukmId: ukmCeria.id, userId: mhs1.id, type: 'income', amount: 195000, category: 'iuran', description: 'Iuran Kas Bulanan September', date: '2026-09-09' },
      { ukmId: ukmCeria.id, userId: mCeria.id, type: 'expense', amount: 105000, category: 'operasional', description: 'Sewa Lapangan Bulutangkis Gelora', date: '2026-09-23' },
      { ukmId: ukmCeria.id, userId: mhs1.id, type: 'income', amount: 235000, category: 'iuran', description: 'Iuran Kas Bulanan Oktober - Ahmad Fauzi dkk', date: '2026-10-08' },
      { ukmId: ukmCeria.id, userId: mCeria.id, type: 'expense', amount: 110000, category: 'kegiatan', description: 'Piala & Medali Turnamen Ceria Cup Internal', date: '2026-10-19' },
    ]);

    // 7. Sesi Pertemuan UKM (Contoh Techcode: 3 kali seminggu)
    console.log('📅 Membuat sesi pertemuan UKM...');
    const mTech1 = await Meeting.create({
      ukmId: ukmTechcode.id,
      meetingNumber: 1,
      title: 'Pertemuan 1: Setup Lingkungan Koding & Git Workflow',
      date: '2026-10-06',
      time: '15:00 - 17:30 WITA',
      location: 'Lab Komputer 1 STMIK Lombok',
      agenda: 'Instalasi Node.js, Git, VS Code, dan dasar git commit & push ke GitHub.',
      status: 'completed',
    });

    const mTech2 = await Meeting.create({
      ukmId: ukmTechcode.id,
      meetingNumber: 2,
      title: 'Pertemuan 2: Algoritma & JavaScript Modern ES6+',
      date: '2026-10-08',
      time: '15:00 - 17:30 WITA',
      location: 'Lab Komputer 1 STMIK Lombok',
      agenda: 'Pembahasan async/await, promise, array methods, dan modularisasi code.',
      status: 'completed',
    });

    const mTech3 = await Meeting.create({
      ukmId: ukmTechcode.id,
      meetingNumber: 3,
      title: 'Pertemuan 3: React 19 Component & Tailwind UI',
      date: '2026-10-10',
      time: '15:00 - 17:30 WITA',
      location: 'Lab Komputer 1 STMIK Lombok',
      agenda: 'Membuat reusable components, useState, useEffect, dan styling dashboard modern.',
      status: 'completed',
    });

    const mTech4 = await Meeting.create({
      ukmId: ukmTechcode.id,
      meetingNumber: 4,
      title: 'Pertemuan 4: REST API Backend & Database SQLite',
      date: '2026-10-13',
      time: '15:00 - 17:30 WITA',
      location: 'Lab Komputer 2 STMIK Lombok',
      agenda: 'Pembuatan API Express.js, routing, Sequelize ORM, dan CRUD transaksi.',
      status: 'completed',
    });

    const mTech5 = await Meeting.create({
      ukmId: ukmTechcode.id,
      meetingNumber: 5,
      title: 'Pertemuan 5: Mini Hackathon Internal Techcode',
      date: '2026-10-15',
      time: '15:00 - 18:00 WITA',
      location: 'Aula STMIK Lombok',
      agenda: 'Sprint koding kelompok 3 jam membuat purwarupa aplikasi kampus.',
      status: 'completed',
    });

    const mTech6 = await Meeting.create({
      ukmId: ukmTechcode.id,
      meetingNumber: 6,
      title: 'Pertemuan 6: Review Proyek & Pengenalan Cyber Security',
      date: '2026-10-17',
      time: '15:00 - 17:30 WITA',
      location: 'Lab Komputer 1 STMIK Lombok',
      agenda: 'Code review hasil mini hackathon, audit keamanan web, dan rate-limiting.',
      status: 'completed',
    });

    // Pertemuan UKM Ceria
    const mCeria1 = await Meeting.create({
      ukmId: ukmCeria.id,
      meetingNumber: 1,
      title: 'Pertemuan 1: Latihan Fisik & Pemanasan Futsal',
      date: '2026-10-07',
      time: '16:00 - 18:00 WITA',
      location: 'GOR Futsal STMIK Lombok',
      agenda: 'Peregangan, lari interval, dan passing dasar futsal.',
      status: 'completed',
    });

    const mCeria2 = await Meeting.create({
      ukmId: ukmCeria.id,
      meetingNumber: 2,
      title: 'Pertemuan 2: Taktik Penyerangan & Laga Uji Coba',
      date: '2026-10-14',
      time: '16:00 - 18:00 WITA',
      location: 'GOR Futsal STMIK Lombok',
      agenda: 'Simulasi pola formasi 1-2-1 dan internal sparring.',
      status: 'completed',
    });

    // 8. Pengajuan Izin (Leave Request)
    console.log('✉️ Membuat data perizinan mahasiswa...');
    const leaveApproved = await LeaveRequest.create({
      ukmId: ukmTechcode.id,
      userId: mhs1.id,
      meetingId: mTech4.id,
      date: mTech4.date,
      reason: 'Ada jadwal praktikum laboratorium komputer jaringan mendadak di kampus.',
      status: 'approved',
      reviewedBy: mTech.id,
      reviewNotes: 'Izin disetujui, silakan pelajari modul pertemuan 4 di E-Book.',
    });

    // 9. Absensi per Pertemuan (Diabsenkan oleh Pengelola)
    console.log('📝 Membuat rekap absensi per pertemuan...');
    await Attendance.bulkCreate([
      // Pertemuan 1 Techcode
      { ukmId: ukmTechcode.id, meetingId: mTech1.id, userId: mhs1.id, status: 'hadir', keterangan: 'Hadir tepat waktu di Lab 1', date: mTech1.date },
      // Pertemuan 2 Techcode
      { ukmId: ukmTechcode.id, meetingId: mTech2.id, userId: mhs1.id, status: 'hadir', keterangan: 'Hadir', date: mTech2.date },
      // Pertemuan 3 Techcode
      { ukmId: ukmTechcode.id, meetingId: mTech3.id, userId: mhs1.id, status: 'hadir', keterangan: 'Hadir aktif bertanya', date: mTech3.date },
      // Pertemuan 4 Techcode: Mahasiswa Izin
      { ukmId: ukmTechcode.id, meetingId: mTech4.id, userId: mhs1.id, status: 'izin', keterangan: 'Izin disetujui: Ada jadwal praktikum laboratorium', date: mTech4.date },
      // Pertemuan 5 Techcode
      { ukmId: ukmTechcode.id, meetingId: mTech5.id, userId: mhs1.id, status: 'hadir', keterangan: 'Hadir Mini Hackathon', date: mTech5.date },
      // Pertemuan 6 Techcode
      { ukmId: ukmTechcode.id, meetingId: mTech6.id, userId: mhs1.id, status: 'hadir', keterangan: 'Hadir Code Review', date: mTech6.date },

      // Ceria
      { ukmId: ukmCeria.id, meetingId: mCeria1.id, userId: mhs1.id, status: 'hadir', keterangan: 'Hadir di GOR', date: mCeria1.date },
      { ukmId: ukmCeria.id, meetingId: mCeria2.id, userId: mhs1.id, status: 'hadir', keterangan: 'Hadir Sparring', date: mCeria2.date },
    ]);

    // 8. Capaian, E-Book & Foto Dokumentasi
    console.log('📚 Menyemai Capaian, E-Book & Foto untuk masing-masing UKM...');
    await Achievement.bulkCreate([
      // Techcode
      {
        ukmId: ukmTechcode.id,
        title: 'Juara 1 Regional Hackathon NTB Digital 2025',
        category: 'capaian',
        description: 'Tim Techcode STMIK Lombok berhasil meraih medali emas dengan inovasi aplikasi Smart Agriculture berbasis IoT dan AI untuk petani tembakau Lombok.',
        year: '2025',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
        author: 'Tim Riset AI Techcode',
      },
      {
        ukmId: ukmTechcode.id,
        title: 'E-Book: Panduan Lengkap Web Developer Modern 2026',
        category: 'ebook',
        description: 'Buku modul digital panduan mandiri belajar JavaScript, React 19, Tailwind, Node.js dan SQLite untuk mahasiswa baru Techcode.',
        year: '2026',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '5.4 MB PDF',
        author: 'Divisi Litbang Techcode',
      },
      {
        ukmId: ukmTechcode.id,
        title: 'Dokumentasi Tech-Camp & Coding Marathon',
        category: 'foto_kegiatan',
        description: 'Keseruan malam keakraban dan coding marathon 24 jam anggota Techcode di Lab Komputer STMIK Lombok.',
        year: '2026',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
        author: 'Dokumentasi Humas',
      },

      // Gumpala
      {
        ukmId: ukmGumpala.id,
        title: 'Ekspedisi 7 Puncak Rinjani & Aksi Bebas Sampah Plastik',
        category: 'capaian',
        description: 'Keberhasilan tim ekspedisi Gumpala mengibarkan bendera STMIK Lombok di Puncak Anjani sekaligus menurunkan 120 kg sampah anorganik.',
        year: '2025',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
        author: 'Tim Ekspedisi Gumpala',
      },
      {
        ukmId: ukmGumpala.id,
        title: 'E-Book: Modul Manajemen Navigasi Darat & Survival Rimba',
        category: 'ebook',
        description: 'Buku saku pegangan lapangan ilmu medan peta kompas (IMPK), pertolongan pertama gawat darurat (PPGD), dan survival hutan tropis.',
        year: '2026',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '8.2 MB PDF',
        author: 'Divisi Kepecintaalaman Gumpala',
      },

      // Haluner
      {
        ukmId: ukmHaluner.id,
        title: 'Pemenang Festival Musik Akustik Kampus Se-NTB 2025',
        category: 'capaian',
        description: 'Band Haluner STMIK Lombok membawakan lagu daerah Sasak bergenre jazz kontemporer dan berhasil meraih piala juara umum.',
        year: '2025',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        author: 'Haluner Acoustic Team',
      },
      {
        ukmId: ukmHaluner.id,
        title: 'E-Book: Bunga Rampai Puisi & Naskah Teater Kampus',
        category: 'ebook',
        description: 'Kumpulan karya sastra, lirik lagu, dan panduan olah vokal teater persembahan anggota UKM Haluner STMIK Lombok.',
        year: '2026',
        imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '3.9 MB PDF',
        author: 'Divisi Teater Haluner',
      },

      // Ceria
      {
        ukmId: ukmCeria.id,
        title: 'Juara 1 Turnamen Futsal Antar Mahasiswa Lombok Tengah',
        category: 'capaian',
        description: 'Tim Futsal Putra UKM Ceria STMIK Lombok menorehkan rekor tak terkalahkan sepanjang babak penyisihan hingga final.',
        year: '2025',
        imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
        author: 'Divisi Futsal Ceria',
      },
      {
        ukmId: ukmCeria.id,
        title: 'E-Book: Panduan Taktik Futsal Modern & Manajemen Kebugaran Atlet',
        category: 'ebook',
        description: 'Buku panduan strategi permainan formasi futsal, jadwal latihan kardio, serta tips nutrisi bugar bagi atlet kampus.',
        year: '2026',
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '4.8 MB PDF',
        author: 'Pelatih & Divisi Olahraga Ceria',
      },
    ]);

    console.log('📝 Membuat data contoh pengajuan pendaftaran UKM (Open Recruitment)...');
    await Application.bulkCreate([
      {
        userId: mhs3.id,
        ukmId: ukmTechcode.id,
        status: 'diajukan',
        motivation: 'Saya ingin memperdalam skill React, Node.js, dan cyber security bersama UKM Techcode.',
      },
      {
        userId: mhs3.id,
        ukmId: ukmGumpala.id,
        status: 'dalam_seleksi',
        motivation: 'Hobi mendaki gunung dan ingin bergabung dalam tim konservasi alam rimba STMIK Lombok.',
      },
    ]);

    console.log('🎉 Seeding 4 UKM STMIK Lombok selesai dengan sukses!');
    console.log('---------------------------------------------------------');
    console.log('Daftar Akun Login Demo:');
    console.log('1. Super Admin       -> NIM: admin             | Pass: admin123');
    console.log('2. Pengelola Techcode-> NIM: manager_techcode  | Pass: manager123');
    console.log('3. Pengelola Gumpala -> NIM: manager_gumpala   | Pass: manager123');
    console.log('4. Pengelola Haluner -> NIM: manager_haluner   | Pass: manager123');
    console.log('5. Pengelola Ceria   -> NIM: manager_ceria     | Pass: manager123');
    console.log('6. Mahasiswa Demo    -> NIM: 220101001         | Pass: password123 (UKM Techcode & Ceria)');
    console.log('---------------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ Gagal menjalankan seeder:', err);
    process.exit(1);
  }
}

seed();
