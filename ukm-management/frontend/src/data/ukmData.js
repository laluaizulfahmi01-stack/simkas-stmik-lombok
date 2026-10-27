// src/data/ukmData.js
import {
  MdCode,
  MdTerrain,
  MdMusicNote,
  MdSportsSoccer,
  MdAccountBalance,
  MdCheckCircle,
  MdAutoStories,
  MdWorkspacePremium,
} from 'react-icons/md';

export const ukmList = [
  {
    name: 'UKM Techcode',
    tag: 'Teknologi & Koding',
    desc: 'Komunitas software development, web & mobile, artificial intelligence, dan cyber security.',
    icon: <MdCode />, // rendered by component
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    name: 'UKM Gumpala',
    tag: 'Pecinta Alam & Rimba',
    desc: 'Ekspedisi gunung, konservasi alam, navigasi darat, panjat tebing, dan aksi siaga bencana.',
    icon: <MdTerrain />, 
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    name: 'UKM Haluner',
    tag: 'Seni, Musik & Budaya',
    desc: 'Wadah kreasi musik modern, akustik, paduan suara, tari tradisional Sasak, dan teater kampus.',
    icon: <MdMusicNote />, 
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    name: 'UKM Ceria',
    tag: 'Olahraga & E-Sports',
    desc: 'Latihan rutin futsal, badminton, basket, serta divisi e-sports Mobile Legends & PUBG Mobile.',
    icon: <MdSportsSoccer />, 
    color: '#ea580c',
    bg: '#fff7ed',
  },
];

export const features = [
  {
    icon: <MdAccountBalance />, 
    color: '#2563eb',
    bg: '#eff6ff',
    title: 'Transparansi Uang Kas',
    desc: 'Semua mahasiswa dapat memantau perputaran uang kas masuk dan pengeluaran secara terbuka dan terperinci.',
  },
  {
    icon: <MdCheckCircle />, 
    color: '#16a34a',
    bg: '#f0fdf4',
    title: 'Presensi & Absensi Digital',
    desc: 'Check-in mandiri mahasiswa di setiap kegiatan UKM dengan rekapitulasi kehadiran real-time.',
  },
  {
    icon: <MdAutoStories />, 
    color: '#d97706',
    bg: '#fffbeb',
    title: 'E-Book & Modul Bacaan',
    desc: 'Akses modul pelatihan, buku saku digital, dan e-book materi resmi masing-masing UKM secara mandiri.',
  },
  {
    icon: <MdWorkspacePremium />, 
    color: '#7c3aed',
    bg: '#f5f3ff',
    title: 'Sejarah & Capaian Prestasi',
    desc: 'Dokumentasi piala kejuaraan, piagam, galeri foto, serta napak tilas sejarah berdirinya organisasi.',
  },
];
