import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ThemeToggle from '../components/ThemeToggle';
import PanoramicCurvedCarousel from '../components/PanoramicCurvedCarousel';
import {
  FiCreditCard, FiCheckCircle, FiArrowUpRight,
  FiBookOpen, FiAward, FiCode, FiCompass,
  FiMusic, FiActivity, FiZap, FiUsers, FiShield, FiArrowRight,
  FiX, FiCheck, FiCalendar, FiClock, FiStar, FiFileText, FiTarget, FiInfo
} from 'react-icons/fi';

/* ── Data Default UKM dengan Keunggulan & Informasi Penting ── */
const defaultUkmList = [
  {
    id: 1,
    name: 'UKM Techcode',
    tag: 'Teknologi & Koding',
    desc: 'Komunitas software development, web & mobile, artificial intelligence, dan cyber security masa depan.',
    icon: <FiCode />,
    color: '#09090b',
    bg: '#ffffff',
    badgeBg: '#ecfccb',
    badgeColor: '#3f6212',
    memberCount: '180+',
    advantages: 'Mentoring Koding & AI Intensif, Proyek Nyata & Portofolio Industri, Sertifikasi Kompetensi Resmi, Akses Komunitas Hackathon Nasional',
    highlights: 'Juara 1 Regional Hackathon NTB Digital 2025',
    activitySchedule: 'Setiap Sabtu pukul 09:00 - 12:00 WITA (Lab Komputer & Hybrid)',
    requirements: 'Mahasiswa aktif STMIK Lombok, berminat di bidang programming / desain / teknologi.',
    vision: 'Menjadi inkubator talenta digital dan software engineer terkemuka di Nusa Tenggara Barat.',
    mission: '1. Menyelenggarakan bootcamp koding mingguan\n2. Mengerjakan proyek nyata untuk UMKM dan kampus\n3. Memenangkan kompetisi teknologi tingkat nasional',
  },
  {
    id: 2,
    name: 'UKM Gumpala',
    tag: 'Pecinta Alam & Rimba',
    desc: 'Ekspedisi gunung, konservasi alam, navigasi darat, panjat tebing, dan aksi siaga bencana sosial.',
    icon: <FiCompass />,
    color: '#09090b',
    bg: '#ffffff',
    badgeBg: '#dbeafe',
    badgeColor: '#1d4ed8',
    memberCount: '140+',
    advantages: 'Pelatihan Survival & Navigasi Darat, Sertifikat PPGD & Siaga Bencana, Ekspedisi Gunung & Konservasi Alam, Persaudaraan Solid Tanpa Batas',
    highlights: 'Ekspedisi 7 Puncak Rinjani & Aksi Bebas Sampah Plastik',
    activitySchedule: 'Latihan Fisik: Selasa & Kamis 16:30 WITA | Ekspedisi: Akhir Pekan Terjadwal',
    requirements: 'Mahasiswa aktif STMIK Lombok, sehat jasmani dan rohani, peduli kelestarian alam.',
    vision: 'Mewujudkan mahasiswa pecinta alam yang tangguh, berwawasan ekologis, dan sigap bencana.',
    mission: '1. Pelatihan navigasi darat dan survival rimba\n2. Konservasi mata air dan penghijauan lereng Rinjani\n3. Relawan siaga bencana kemanusiaan',
  },
  {
    id: 3,
    name: 'UKM Haluner',
    tag: 'Seni, Musik & Budaya',
    desc: 'Wadah kreasi musik modern, akustik, paduan suara, tari tradisional Sasak, teater, dan sastra kampus.',
    icon: <FiMusic />,
    color: '#09090b',
    bg: '#ffffff',
    badgeBg: '#ede9fe',
    badgeColor: '#6d28d9',
    memberCount: '160+',
    advantages: 'Fasilitas Studio Musik & Alat Band Lengkap, Bimbingan Vokal & Tari Tradisional Sasak, Panggung Kreasi Acara Kampus & Luar Kampus, Wadah Eksplorasi Teater & Sastra',
    highlights: 'Pemenang Festival Musik Akustik Kampus Se-NTB 2025',
    activitySchedule: 'Latihan Rutin: Rabu & Jumat pukul 15:30 - 18:00 WITA (Ruang Kesenian Kampus)',
    requirements: 'Mahasiswa aktif STMIK Lombok, memiliki minat seni musik, vokal, tari, atau teater.',
    vision: 'Pusat eksplorasi seni kontemporer dan pelestarian budaya tradisional Sasak di lingkungan civitas akademika.',
    mission: '1. Mengembangkan grup band akustik dan paduan suara kampus\n2. Melestarikan tarian dan musik tradisional Sasak\n3. Mementaskan karya teater dan sastra mahasiswa',
  },
  {
    id: 4,
    name: 'UKM Ceria',
    tag: 'Olahraga & E-Sports',
    desc: 'Latihan rutin futsal, badminton, basket, serta divisi e-sports kompetitif Mobile Legends & PUBG Mobile.',
    icon: <FiActivity />,
    color: '#09090b',
    bg: '#ffffff',
    badgeBg: '#ffedd5',
    badgeColor: '#c2410c',
    memberCount: '190+',
    advantages: 'Sparing & Latihan Futsal / Badminton Terjadwal, Pembinaan Atlet Menuju PORSENI, Divisi E-Sports Profesional (MLBB & PUBGM), Fasilitas Lapangan & Jersey Resmi Tim',
    highlights: 'Juara 1 Turnamen Futsal Lombok Tengah 2025',
    activitySchedule: 'Latihan Olahraga: Senin & Kamis 16:00 WITA | Scrim E-Sports: Sabtu Malam',
    requirements: 'Mahasiswa aktif STMIK Lombok, menjunjung tinggi sportivitas, disiplin, dan kekompakan tim.',
    vision: 'Membentuk mahasiswa yang sehat, berprestasi di kancah olahraga kampus dan e-sports nasional.',
    mission: '1. Mengasah fisik dan strategi pertandingan rutin\n2. Mengikuti turnamen antar universitas se-Nusa Tenggara Barat\n3. Menumbuhkan jiwa kepemimpinan dan sportif',
  },
];

const features = [
  {
    icon: <FiCreditCard />,
    title: 'Transparansi Uang Kas',
    desc: 'Pantau perputaran kas masuk dan pengeluaran secara terbuka dan real-time.',
    badge: 'Real-time',
  },
  {
    icon: <FiCheckCircle />,
    title: 'Presensi & Absensi Digital',
    desc: 'Check-in mandiri di setiap kegiatan UKM dengan rekapitulasi kehadiran otomatis.',
    badge: 'QR & Digital',
  },
  {
    icon: <FiBookOpen />,
    title: 'E-Book & Modul Bacaan',
    desc: 'Akses modul pelatihan dan e-book materi resmi masing-masing UKM secara mandiri.',
    badge: 'PDF / E-Book',
  },
  {
    icon: <FiAward />,
    title: 'Sejarah & Capaian Prestasi',
    desc: 'Dokumentasi piala kejuaraan, piagam, galeri foto, serta arsip sejarah organisasi.',
    badge: 'Arsip Resmi',
  },
];

const stats = [
  { icon: <FiUsers />, value: '600+', label: 'Mahasiswa Aktif' },
  { icon: <FiShield />, value: '4', label: 'UKM Resmi' },
  { icon: <FiAward />, value: '50+', label: 'Prestasi Diraih' },
  { icon: <FiZap />, value: '120+', label: 'Kegiatan / Tahun' },
];

/* ── Silky Smooth Scroll Reveal Component ───────────────────── */
function ScrollRevealItem({ children, className = '', delay = '', style = {} }) {
  const [revealed, setRevealed] = useState(false);
  const elementRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`scroll-motion-reveal ${revealed ? 'is-revealed' : ''} ${delay} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [ukms, setUkms] = useState(defaultUkmList);
  const [selectedUkm, setSelectedUkm] = useState(null);
  const [detailTab, setDetailTab] = useState('keunggulan'); // 'keunggulan' | 'capaian' | 'info'
  const [publicEvents, setPublicEvents] = useState([]);

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    api.get('/ukm')
      .then(res => {
        if (res.data && res.data.length > 0) {
          const merged = defaultUkmList.map(def => {
            const remote = res.data.find(r => r.id === def.id || r.name?.toLowerCase() === def.name?.toLowerCase());
            if (!remote) return def;
            return {
              ...def,
              ...remote,
              name: remote.name || def.name,
              desc: remote.description || def.desc,
              tag: remote.tag || def.tag,
              advantages: remote.advantages || def.advantages,
              highlights: remote.highlights || def.highlights,
              activitySchedule: remote.activitySchedule || def.activitySchedule,
              requirements: remote.requirements || def.requirements,
              registrationOpen: remote.registrationOpen,
              registrationOpenDate: remote.registrationOpenDate,
              registrationCloseDate: remote.registrationCloseDate,
              matriculationDate: remote.matriculationDate,
              matriculationTime: remote.matriculationTime,
              matriculationLocation: remote.matriculationLocation,
              matriculationNotes: remote.matriculationNotes,
              memberCount: remote.members ? `${remote.members.length}+` : def.memberCount,
              achievements: remote.achievements || [],
            };
          });
          setUkms(merged);
        }
      })
      .catch(err => {
        console.warn('Menggunakan data UKM lokal:', err.message);
      });

    api.get('/events/public')
      .then(res => {
        if (res.data) setPublicEvents(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e8edf2',
        color: '#09090b',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Navbar ────────────────────────────── */}
      <header className={`landing-header-pill${headerScrolled ? ' scrolled' : ''}`}>
        <Link to="/" className="landing-brand-link">
          <div className="landing-logo-box">
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
          <div className="landing-brand-text">
            <div className="brand-title">SIMKAS</div>
            <div className="brand-sub">STMIK LOMBOK</div>
          </div>
        </Link>

        <div className="landing-nav-actions">
          <ThemeToggle variant="icon" />
          <Link to="/login" className="landing-login-link">
            Masuk
          </Link>
          <Link to="/register" className="landing-register-link">
            <span className="register-text-desktop">Daftar Sekarang</span>
            <span className="register-text-mobile">Daftar</span>
            <FiArrowUpRight style={{ fontSize: 14 }} />
          </Link>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────── */}
      <ScrollRevealItem>
        <section style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid #e2e8f0', padding: '6px 16px', borderRadius: 999, marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d4ff00' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#09090b', letterSpacing: 0.5 }}>
              SISTEM INFORMASI MANAJEMEN UKM RESMI
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 900,
              letterSpacing: -1.5,
              lineHeight: 1.15,
              color: '#09090b',
              maxWidth: 820,
              margin: '0 auto 20px',
            }}
          >
            Satu Platform Terpadu untuk <br />
            <span style={{ background: 'linear-gradient(135deg, #09090b 40%, #64748b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              4 UKM STMIK Lombok
            </span>
          </h1>

          <p
            style={{
              fontSize: 16,
              color: '#64748b',
              maxWidth: 640,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            Transparansi catatan kas, pencatatan absensi kegiatan, modul e-book digital, serta
            arsip sejarah dan capaian prestasi mahasiswa — dalam genggaman modern.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 50 }}>
            <Link
              to="/register"
              style={{
                textDecoration: 'none',
                background: '#09090b',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 800,
                padding: '14px 28px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 10px 25px -8px rgba(15, 23, 42, 0.25)',
              }}
            >
              <span>Daftar Mahasiswa Baru</span>
              <FiArrowUpRight style={{ fontSize: 17 }} />
            </Link>
            <Link
              to="/login"
              style={{
                textDecoration: 'none',
                background: '#ffffff',
                color: '#09090b',
                fontSize: 14,
                fontWeight: 700,
                padding: '14px 26px',
                borderRadius: 999,
                border: '1px solid #e2e8f0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Masuk Akun
            </Link>
          </div>

          {/* 4 Top Stat Cards matching INFLUENCY */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, textAlign: 'left', marginBottom: 60 }}>
            <ScrollRevealItem delay="stagger-delay-1">
              <div style={{ background: '#d4ff00', borderRadius: 24, padding: 22, color: '#09090b', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    <FiUsers />
                  </div>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiArrowUpRight style={{ fontSize: 16 }} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>600+</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Mahasiswa Aktif</div>
              </div>
            </ScrollRevealItem>

            <ScrollRevealItem delay="stagger-delay-2">
              <div style={{ background: '#ffffff', borderRadius: 24, padding: 22, border: '1px solid rgba(0,0,0,0.06)', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#09090b' }}>
                    <FiShield />
                  </div>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiArrowUpRight style={{ fontSize: 16, color: '#09090b' }} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#09090b', letterSpacing: -0.5 }}>4 UKM</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Organisasi Resmi</div>
              </div>
            </ScrollRevealItem>

            <ScrollRevealItem delay="stagger-delay-3">
              <div style={{ background: '#ffffff', borderRadius: 24, padding: 22, border: '1px solid rgba(0,0,0,0.06)', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#09090b' }}>
                    <FiAward />
                  </div>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiArrowUpRight style={{ fontSize: 16, color: '#09090b' }} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#09090b', letterSpacing: -0.5 }}>50+</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Prestasi Diraih</div>
              </div>
            </ScrollRevealItem>

            <ScrollRevealItem delay="stagger-delay-4">
              <div style={{ background: '#ffffff', borderRadius: 24, padding: 22, border: '1px solid rgba(0,0,0,0.06)', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#09090b' }}>
                    <FiZap />
                  </div>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiArrowUpRight style={{ fontSize: 16, color: '#09090b' }} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#09090b', letterSpacing: -0.5 }}>120+</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Kegiatan / Tahun</div>
              </div>
            </ScrollRevealItem>
          </div>
        </section>
      </ScrollRevealItem>

      {/* ── 3D Panoramic Curved Activities Showcase (Persis Referensi Gambar) ── */}
      <PanoramicCurvedCarousel />

      {/* ── 4 UKM Cards ──────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto 60px', padding: '0 24px' }}>
        <ScrollRevealItem>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                UNIT KEGIATAN MAHASISWA
              </span>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#09090b', margin: '6px 0 0', letterSpacing: -0.5 }}>
                4 UKM Resmi STMIK Lombok
              </h2>
            </div>
            <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
              Setiap mahasiswa dapat memilih maksimal 2 UKM sesuai minat & bakat
            </p>
          </div>
        </ScrollRevealItem>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 20 }}>
          {ukms.map((u, i) => {
            const advList = (u.advantages || '')
              .split(/[\n,]+/)
              .map(s => s.trim())
              .filter(Boolean);
            const topHighlight = u.highlights || (u.achievements && u.achievements[0]?.title);

            return (
              <ScrollRevealItem key={u.id || i} delay={`stagger-delay-${(i % 4) + 1}`} style={{ height: '100%' }}>
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: 24,
                    padding: 24,
                    border: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 30px -10px rgba(15, 23, 42, 0.06)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <div>
                    {/* Top Badge & Icon */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, color: '#09090b'
                      }}>
                        {u.icon}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{
                          background: u.registrationOpen ? '#dcfce7' : '#f1f5f9',
                          color: u.registrationOpen ? '#15803d' : '#64748b',
                          fontSize: 10.5, fontWeight: 800, padding: '3px 8px',
                          borderRadius: 999
                        }}>
                          {u.registrationOpen ? '🟢 Buka' : '⚪ Tutup'}
                        </span>
                        <span style={{
                          background: u.badgeBg, color: u.badgeColor,
                          fontSize: 11, fontWeight: 800, padding: '4px 10px',
                          borderRadius: 999
                        }}>
                          {u.tag}
                        </span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 6px', color: '#09090b', letterSpacing: -0.3 }}>
                      {u.name}
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 12px' }}>
                      {u.desc}
                    </p>

                    {/* Jadwal Matrikulasi Dinamis Khusus UKM ini */}
                    {u.matriculationDate && (
                      <div style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: 12,
                        padding: '6px 10px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 14,
                      }}>
                        <span>🗓️</span>
                        <span>Matrikulasi: {new Date(u.matriculationDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} ({u.matriculationTime || '09:00 WITA'})</span>
                      </div>
                    )}

                    {/* Highlight Capaian / Prestasi */}
                    {topHighlight && (
                      <div style={{
                        background: 'rgba(234, 179, 8, 0.1)',
                        border: '1px solid rgba(234, 179, 8, 0.25)',
                        borderRadius: 12,
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 16,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#854d0e',
                      }}>
                        <span style={{ fontSize: 14 }}>🏆</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {topHighlight}
                        </span>
                      </div>
                    )}

                    {/* Keunggulan Masuk UKM Ini */}
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: 14,
                      padding: '12px 14px',
                      marginBottom: 18,
                      border: '1px solid #f1f5f9',
                    }}>
                      <div style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        marginBottom: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}>
                        <FiStar style={{ color: '#2563eb' }} />
                        <span>Keunggulan Bergabung:</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {advList.slice(0, 3).map((adv, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: '#1e293b', fontWeight: 600 }}>
                            <span style={{ color: '#16a34a', fontSize: 13, lineHeight: 1 }}>✓</span>
                            <span style={{ lineHeight: 1.3 }}>{adv}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row Actions */}
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 14,
                      borderTop: '1px solid #f1f5f9',
                      marginBottom: 12,
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>
                        👥 {u.memberCount} Mahasiswa
                      </span>
                      <button
                        type="button"
                        onClick={() => { setSelectedUkm(u); setDetailTab('keunggulan'); }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        Lihat Capaian & Detail &rarr;
                      </button>
                    </div>

                    <Link
                      to={`/register?ukm=${u.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 12,
                        background: '#09090b',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 700,
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <span>Daftar {u.name}</span>
                      <FiArrowRight style={{ fontSize: 14 }} />
                    </Link>
                  </div>
                </div>
              </ScrollRevealItem>
            );
          })}
        </div>
      </section>

      {/* ── Public Events & Agenda Kegiatan UKM ─────────────────── */}
      {publicEvents.length > 0 && (
        <section style={{ maxWidth: 1200, margin: '0 auto 64px', padding: '0 24px' }}>
          <ScrollRevealItem>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1 }}>
                  AGENDA & EVENT KAMPUS
                </span>
                <h2 style={{ fontSize: 28, fontWeight: 900, color: '#09090b', margin: '6px 0 0', letterSpacing: -0.5 }}>
                  Event & Aktivitas Terbuka UKM STMIK Lombok
                </h2>
                <p style={{ fontSize: 14, color: '#64748b', margin: '6px 0 0', maxWidth: 620 }}>
                  Ikuti seminar, workshop teknologi, pentas seni, turnamen olahraga, serta orientasi gelombang pendaftaran baru.
                </p>
              </div>

              <Link
                to="/register"
                style={{
                  borderRadius: 999,
                  background: '#09090b',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: 'none',
                  padding: '10px 22px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <FiCalendar /> Gabung & Ikuti Event
              </Link>
            </div>
          </ScrollRevealItem>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {publicEvents.map((ev, i) => {
              const evDate = new Date(ev.startTime);
              return (
                <ScrollRevealItem key={ev.id} delay={`stagger-delay-${(i % 4) + 1}`} style={{ height: '100%' }}>
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 22,
                      padding: '22px',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: 999,
                            background: '#eff6ff',
                            color: '#1d4ed8',
                          }}
                        >
                          {ev.ukm?.name || 'UKM STMIK Lombok'}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d' }}>
                          🌐 Event Publik
                        </span>
                      </div>

                      <h3 style={{ fontSize: 16, fontWeight: 900, color: '#09090b', margin: '4px 0 8px', lineHeight: 1.4 }}>
                        {ev.title}
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
                        {ev.description || 'Kegiatan resmi diselenggarakan oleh pengelola UKM.'}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#475569', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FiClock style={{ color: '#2563eb', fontSize: 14 }} />
                          <span>
                            {evDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} • {evDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>📍</span>
                          <span>{ev.location || 'Kampus STMIK Lombok'}</span>
                        </div>
                      </div>

                      <Link
                        to={`/register?ukm=${ev.ukmId}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          width: '100%',
                          padding: '9px 14px',
                          borderRadius: 12,
                          background: '#f8fafc',
                          color: '#09090b',
                          border: '1px solid #e2e8f0',
                          textDecoration: 'none',
                          fontSize: 12.5,
                          fontWeight: 700,
                        }}
                      >
                        <span>Daftar {ev.ukm?.name}</span>
                        <FiArrowRight style={{ fontSize: 13 }} />
                      </Link>
                    </div>
                  </div>
                </ScrollRevealItem>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Features Section ─────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto 60px', padding: '0 24px' }}>
        <ScrollRevealItem>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
              FITUR PLATFORM
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#09090b', margin: '6px 0 0', letterSpacing: -0.5 }}>
              Pengalaman Modern & Transparan
            </h2>
          </div>
        </ScrollRevealItem>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <ScrollRevealItem key={i} delay={`stagger-delay-${(i % 4) + 1}`} style={{ height: '100%' }}>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 24,
                  padding: 24,
                  border: '1px solid rgba(0,0,0,0.06)',
                  height: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#09090b' }}>
                    {f.icon}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f8fafc', padding: '3px 8px', borderRadius: 999 }}>
                    {f.badge}
                  </span>
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px', color: '#09090b' }}>{f.title}</h4>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
              </div>
            </ScrollRevealItem>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto 60px', padding: '0 24px' }}>
        <ScrollRevealItem>
          <div
            style={{
              background: '#d4ff00',
              borderRadius: 32,
              padding: '40px 36px',
              color: '#09090b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>Siap Bergabung dengan UKM?</h2>
              <p style={{ fontSize: 15, color: '#334155', margin: '8px 0 0' }}>
                Jadilah bagian dari komunitas UKM STMIK Lombok yang aktif, kreatif, dan berprestasi.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link
                to="/register"
                style={{
                  background: '#09090b',
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 14,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>Daftar Sekarang</span>
                <FiArrowUpRight style={{ fontSize: 16 }} />
              </Link>
              <Link
                to="/login"
                style={{
                  background: '#ffffff',
                  color: '#09090b',
                  padding: '14px 24px',
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                Sudah Punya Akun? Masuk
              </Link>
            </div>
          </div>
        </ScrollRevealItem>
      </section>

      {/* ── Footer ───────────────────────────── */}
      <footer style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                overflow: 'hidden',
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
            <span style={{ fontSize: 14, fontWeight: 800, color: '#09090b' }}>SIMKAS – STMIK Lombok</span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            © 2026 SIMKAS &bull; Sistem Informasi Manajemen UKM &bull; Hak Cipta Dilindungi
          </div>
        </div>
      </footer>
      {/* ── Modal Detail & Capaian Lengkap UKM ── */}
      {selectedUkm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'simkasCardPop 0.3s ease-out forwards',
          }}
          onClick={() => setSelectedUkm(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 28,
              width: '100%',
              maxWidth: 680,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              padding: '28px 32px',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, color: '#09090b'
                }}>
                  {selectedUkm.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: '#09090b', letterSpacing: -0.5 }}>
                      {selectedUkm.name}
                    </h3>
                    <span style={{
                      background: selectedUkm.badgeBg, color: selectedUkm.badgeColor,
                      fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999
                    }}>
                      {selectedUkm.tag}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, color: '#64748b' }}>
                    Unit Kegiatan Mahasiswa Resmi STMIK Lombok &bull; {selectedUkm.memberCount} Mahasiswa
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUkm(null)}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#f1f5f9', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 18, color: '#64748b'
                }}
              >
                <FiX />
              </button>
            </div>

            {/* Navigation Tabs inside modal */}
            <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setDetailTab('keunggulan')}
                style={{
                  background: detailTab === 'keunggulan' ? '#09090b' : 'transparent',
                  color: detailTab === 'keunggulan' ? '#ffffff' : '#64748b',
                  border: 'none', borderRadius: 999, padding: '8px 16px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <FiStar /> Keunggulan Masuk UKM
              </button>
              <button
                type="button"
                onClick={() => setDetailTab('capaian')}
                style={{
                  background: detailTab === 'capaian' ? '#09090b' : 'transparent',
                  color: detailTab === 'capaian' ? '#ffffff' : '#64748b',
                  border: 'none', borderRadius: 999, padding: '8px 16px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <FiAward /> Capaian & Prestasi
              </button>
              <button
                type="button"
                onClick={() => setDetailTab('info')}
                style={{
                  background: detailTab === 'info' ? '#09090b' : 'transparent',
                  color: detailTab === 'info' ? '#ffffff' : '#64748b',
                  border: 'none', borderRadius: 999, padding: '8px 16px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <FiInfo /> Jadwal & Visi Misi
              </button>
            </div>

            {/* Tab 1: Keunggulan Masuk UKM */}
            {detailTab === 'keunggulan' && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(56,189,248,0.08) 100%)',
                  borderRadius: 18, padding: 20, marginBottom: 18,
                  border: '1px solid rgba(37,99,235,0.15)'
                }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#1e3a8a' }}>
                    Kenapa Anda Harus Bergabung dengan {selectedUkm.name}?
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                    {selectedUkm.desc}
                  </p>
                </div>

                <h5 style={{ fontSize: 14, fontWeight: 800, color: '#09090b', margin: '0 0 12px' }}>
                  Keuntungan & Fasilitas yang Anda Dapatkan:
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginBottom: 20 }}>
                  {(selectedUkm.advantages || '')
                    .split(/[\n,]+/)
                    .map(s => s.trim())
                    .filter(Boolean)
                    .map((adv, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 14,
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      >
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: '#dcfce7', color: '#15803d',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, flexShrink: 0
                        }}>
                          ✓
                        </div>
                        <span>{adv}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Tab 2: Capaian & Prestasi */}
            {detailTab === 'capaian' && (
              <div>
                <h5 style={{ fontSize: 14, fontWeight: 800, color: '#09090b', margin: '0 0 12px' }}>
                  Daftar Prestasi & Dokumen Resmi (Dikelola Pengelola UKM):
                </h5>
                {selectedUkm.achievements && selectedUkm.achievements.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    {selectedUkm.achievements.map((ach, idx) => (
                      <div
                        key={ach.id || idx}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: 16,
                          padding: '16px 20px',
                          background: '#f8fafc',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{
                            background: ach.category === 'capaian' ? '#fef3c7' : ach.category === 'ebook' ? '#dbeafe' : '#ede9fe',
                            color: ach.category === 'capaian' ? '#92400e' : ach.category === 'ebook' ? '#1e40af' : '#6b21a8',
                            fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999
                          }}>
                            {ach.category === 'capaian' ? '🏆 Kejuaraan' : ach.category === 'ebook' ? '📖 Modul / E-Book' : '📸 Kegiatan'} &bull; {ach.year}
                          </span>
                        </div>
                        <h6 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 6px', color: '#09090b' }}>
                          {ach.title}
                        </h6>
                        {ach.description && (
                          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                            {ach.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 16px', background: '#f8fafc', borderRadius: 16, marginBottom: 20 }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                      🏆 {selectedUkm.highlights || 'Belum ada data prestasi spesifik yang ditambahkan oleh pengelola.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Jadwal & Syarat */}
            {detailTab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#09090b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    📅 Jadwal Latihan / Pertemuan Rutin:
                  </div>
                  <div style={{ fontSize: 13, color: '#475569' }}>
                    {selectedUkm.activitySchedule || 'Setiap akhir pekan (Sabtu / Minggu) terjadwal di kampus.'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#09090b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    📋 Persyaratan Calon Anggota:
                  </div>
                  <div style={{ fontSize: 13, color: '#475569' }}>
                    {selectedUkm.requirements || 'Mahasiswa aktif STMIK Lombok, berkomitmen mengikuti kegiatan dan pengembangan diri.'}
                  </div>
                </div>

                {selectedUkm.vision && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#09090b', marginBottom: 6 }}>
                      🎯 Visi Organisasi:
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                      {selectedUkm.vision}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Bottom Action Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Tertarik bergabung? Daftarkan diri Anda sekarang.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedUkm(null)}
                  style={{
                    padding: '10px 20px', borderRadius: 999,
                    border: '1px solid #e2e8f0', background: '#ffffff',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#09090b'
                  }}
                >
                  Tutup
                </button>
                <Link
                  to={`/register?ukm=${selectedUkm.id}`}
                  style={{
                    padding: '10px 24px', borderRadius: 999,
                    background: '#09090b', color: '#ffffff',
                    textDecoration: 'none', fontSize: 13, fontWeight: 800,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                  }}
                >
                  <span>Daftar {selectedUkm.name}</span>
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
