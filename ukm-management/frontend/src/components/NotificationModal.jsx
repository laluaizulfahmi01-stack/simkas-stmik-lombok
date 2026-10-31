// src/components/NotificationModal.jsx - Sistem Notifikasi Terpadu Multi-Device
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  MdNotifications, MdNotificationsActive, MdClose, MdCheckCircle,
  MdSchedule, MdInfo, MdHowToReg, MdFactCheck, MdAccountBalance,
  MdCircleNotifications
} from 'react-icons/md';

export default function NotificationModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [devicePermission, setDevicePermission] = useState('default');
  const [notifications, setNotifications] = useState([]);

  const isAccepted = Boolean(user?.ukms && user.ukms.length > 0);

  // Check browser notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setDevicePermission(Notification.permission);
    }
  }, []);

  // Request browser notification permission
  const requestDeviceNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setDevicePermission(perm);
        if (perm === 'granted') {
          new Notification('SIMKAS STMIK Lombok', {
            body: 'Notifikasi perangkat berhasil diaktifkan! Anda akan menerima update jadwal dan status akun di HP & perangkat ini.',
            icon: '/simkas-logo.png',
          });
        }
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    }
  };

  // Generate role & status-based notification feeds
  useEffect(() => {
    if (!user) return;

    if (!isAccepted) {
      // ── Feed untuk Calon Anggota (Dinamis dari Pendaftaran UKM Pilihan) ──
      api.get('/applications/my')
        .then(res => {
          const myApps = res.data || [];
          const target = myApps[0]?.ukm;
          const ukmName = target?.name || 'UKM Pilihan Anda';
          const matDateStr = target?.matriculationDate
            ? new Date(target.matriculationDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            : 'Jadwal matrikulasi segera diumumkan pengelola';
          const matTime = target?.matriculationTime || '09:00 - 12:30 WITA';
          const matLoc = target?.matriculationLocation || 'Kampus STMIK Lombok';
          const notes = target?.matriculationNotes || 'Wajib hadir membawa KTM resmi atau bukti registrasi kampus.';

          setNotifications([
            {
              id: 'notif-1',
              type: 'matriculation',
              title: `🗓️ Jadwal Matrikulasi: ${ukmName}`,
              message: `Sesi seleksi & matrikulasi ${ukmName} dijadwalkan pada ${matDateStr} (${matTime}) bertempat di ${matLoc}. ${notes}`,
              time: 'Jadwal Resmi UKM',
              isNew: true,
              icon: <MdSchedule style={{ color: '#d97706' }} />,
              bg: '#fffbeb',
              badge: 'Wajib Diikuti',
              badgeColor: 'badge-yellow',
            },
            {
              id: 'notif-2',
              type: 'requirement',
              title: `📋 Syarat Kelulusan ${ukmName}`,
              message: `Untuk dapat diterima menjadi anggota resmi, calon anggota wajib mengikuti agenda matrikulasi dan verifikasi identitas mahasiswa.`,
              time: 'Informasi UKM',
              isNew: true,
              icon: <MdInfo style={{ color: '#2563eb' }} />,
              bg: '#eff6ff',
              badge: 'Syarat Seleksi',
              badgeColor: 'badge-blue',
            },
            {
              id: 'notif-3',
              type: 'account',
              title: '🔒 Status Hak Akses Akun Anda',
              message: 'Akun Anda saat ini aktif sebagai Calon Mahasiswa Terdaftar. Akses buku kas dan presensi kegiatan akan terbuka secara otomatis setelah Anda resmi DITERIMA.',
              time: 'Saat Pendaftaran',
              isNew: false,
              icon: <MdHowToReg style={{ color: '#16a34a' }} />,
              bg: '#f0fdf4',
              badge: 'Status Akun',
              badgeColor: 'badge-green',
            },
          ]);
        })
        .catch(() => {});
    } else {
      // ── Feed untuk Mahasiswa yang Sudah Resmi Diterima ──
      const ukmId = user.ukms[0]?.id;
      const ukmName = user.ukms[0]?.name || 'UKM Kampus';

      api.get(`/events/${ukmId}`)
        .then(res => {
          const evList = res.data || [];
          const nextEv = evList[0];

          const dynamicNotifs = [
            {
              id: 'notif-acc-1',
              type: 'welcome',
              title: `🎉 Selamat! Anda Resmi Diterima di ${ukmName}`,
              message: `Pengelola UKM telah menyetujui pendaftaran Anda. Hak akses penuh ke catatan kas transparan, modul e-book, dan presensi kegiatan kini telah aktif.`,
              time: 'Baru saja',
              isNew: true,
              icon: <MdCheckCircle style={{ color: '#16a34a' }} />,
              bg: '#f0fdf4',
              badge: 'Diterima Resmi',
              badgeColor: 'badge-green',
            },
          ];

          if (nextEv) {
            const evDate = new Date(nextEv.startTime);
            dynamicNotifs.push({
              id: `notif-ev-${nextEv.id}`,
              type: 'attendance',
              title: `📅 Agenda Mendatang: ${nextEv.title}`,
              message: `${nextEv.description || 'Kegiatan UKM'} • Pelaksanaan: ${evDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} di ${nextEv.location || 'Kampus STMIK Lombok'}.`,
              time: 'Agenda Terjadwal',
              isNew: true,
              icon: <MdFactCheck style={{ color: '#2563eb' }} />,
              bg: '#eff6ff',
              badge: 'Event UKM',
              badgeColor: 'badge-blue',
            });
          }

          dynamicNotifs.push({
            id: 'notif-acc-3',
            type: 'finance',
            title: '💳 Update Laporan Kas Bulanan',
            message: `Pembukuan kas terbaru periode bulan ini telah diperbarui oleh bendahara ${ukmName}. Anda dapat memantau perputaran dana di menu Catatan Kas.`,
            time: 'Kemarin',
            isNew: false,
            icon: <MdAccountBalance style={{ color: '#7c3aed' }} />,
            bg: '#f5f3ff',
            badge: 'Transparansi Kas',
            badgeColor: 'badge-purple',
          });

          setNotifications(dynamicNotifs);
        })
        .catch(() => {});
    }
  }, [user, isAccepted]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ zIndex: 9999, animation: 'fadeIn 0.2s ease' }}
    >
      <div
        className="modal"
        style={{
          maxWidth: 540,
          borderRadius: 24,
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(37, 99, 235, 0.12)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              <MdNotifications />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
                Pusat Notifikasi SIMKAS
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                {isAccepted ? 'Update kegiatan & presensi anggota' : 'Informasi seleksi & jadwal matrikulasi'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <MdClose />
          </button>
        </div>

        {/* Device Push Notification Activation Banner */}
        {devicePermission !== 'granted' && (
          <div
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
              borderBottom: '1px solid #bfdbfe',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 12, color: '#1e3a8a', lineHeight: 1.4, maxWidth: 330 }}>
              <strong>Notifikasi HP / Device:</strong> Dapatkan pemberitahuan langsung di layar HP saat jadwal matrikulasi atau status pendaftaran Anda diumumkan.
            </div>
            <button
              type="button"
              onClick={requestDeviceNotification}
              className="btn btn-primary btn-sm"
              style={{
                borderRadius: 999,
                fontSize: 11,
                padding: '6px 14px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#2563eb',
              }}
            >
              <MdNotificationsActive /> Aktifkan di HP
            </button>
          </div>
        )}

        {/* Notification List */}
        <div style={{ maxHeight: 420, overflowY: 'auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: item.isNew ? '1.5px solid #93c5fd' : '1px solid var(--border)',
                  borderRadius: 16,
                  padding: 16,
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  boxShadow: item.isNew ? '0 4px 14px rgba(37, 99, 235, 0.08)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: item.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text-primary)' }}>
                      {item.title}
                    </div>
                  </div>
                  <span className={`badge ${item.badgeColor}`} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999 }}>
                    {item.badge}
                  </span>
                </div>

                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px 42px' }}>
                  {item.message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)', marginLeft: 42 }}>
                  <span>{item.time}</span>
                  {item.isNew && (
                    <span style={{ color: '#2563eb', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb' }} />
                      Belum Dibaca
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            background: 'var(--bg-subtle)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            SIMKAS STMIK Lombok • Notifikasi Real-Time
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ borderRadius: 8, fontSize: 12, fontWeight: 700 }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

