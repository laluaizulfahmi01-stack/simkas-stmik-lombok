// routes/attendance.js - Pertemuan-Based Attendance & Leave Request Workflow
const express = require('express');
const { Attendance, User, Ukm, Meeting, LeaveRequest, UserUkm } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { auditLog } = require('../security');

const router = express.Router();

// Helper: verify user can access this UKM
async function verifyAccess(req, res, next) {
  const { ukmId } = req.params;
  const user = req.user;
  if (user.role === 'superadmin') return next();
  if (user.role === 'manager') {
    const ukm = await Ukm.findOne({ where: { id: ukmId, managerId: user.id } });
    if (!ukm) return res.status(403).json({ message: 'Akses ditolak: bukan UKM binaan Anda' });
    return next();
  }
  const memberUkms = await user.getUkms({ where: { id: ukmId } });
  if (!memberUkms.length) return res.status(403).json({ message: 'Akses ditolak: Anda bukan anggota UKM ini' });
  next();
}

// ── 1. SESI PERTEMUAN (MEETINGS) ─────────────────────────────────────────────

// Helper to generate unique QR Token
function generateQrToken(ukmId, meetingNumber) {
  const code = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `UKM${ukmId}-M${meetingNumber || 1}-${code}`;
}

// GET /api/attendance/:ukmId/meetings
router.get('/:ukmId/meetings', authenticateToken, verifyAccess, async (req, res) => {
  const { ukmId } = req.params;
  try {
    const meetings = await Meeting.findAll({
      where: { ukmId },
      include: [
        {
          model: Attendance,
          as: 'attendances',
          attributes: ['id', 'userId', 'status'],
        },
        {
          model: LeaveRequest,
          as: 'leaveRequests',
          attributes: ['id', 'userId', 'status', 'reason', 'attachment'],
        },
      ],
      order: [['meetingNumber', 'ASC'], ['date', 'ASC']],
    });

    // Ensure all meetings have a qrToken
    for (const m of meetings) {
      if (!m.qrToken) {
        const token = generateQrToken(ukmId, m.meetingNumber);
        await m.update({ qrToken: token, isActive: true });
        m.qrToken = token;
      }
    }

    res.json(meetings);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memuat daftar pertemuan' });
  }
});

// POST /api/attendance/:ukmId/meetings  (Manager / Superadmin)
router.post('/:ukmId/meetings', authenticateToken, authorizeRoles('manager', 'superadmin'), verifyAccess, async (req, res) => {
  const { ukmId } = req.params;
  const { meetingNumber, title, date, time, location, agenda, status, qrToken } = req.body;

  if (!title || !date) {
    return res.status(400).json({ message: 'Judul dan tanggal pertemuan wajib diisi' });
  }

  try {
    let num = meetingNumber;
    if (!num) {
      const count = await Meeting.count({ where: { ukmId } });
      num = count + 1;
    }

    const token = qrToken || generateQrToken(ukmId, num);

    const meeting = await Meeting.create({
      ukmId,
      meetingNumber: num,
      title,
      date,
      time: time || '14:00 - 16:30 WITA',
      location: location || 'Kampus STMIK Lombok',
      agenda,
      status: status || 'completed',
      qrToken: token,
      isActive: true,
    });

    auditLog('MEETING_CREATED', req.user.id, { ukmId, meetingId: meeting.id, title, qrToken: token });
    res.status(201).json(meeting);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal membuat sesi pertemuan' });
  }
});

// POST /api/attendance/:ukmId/check-in  (Mahasiswa Mandiri Check-In)
router.post('/:ukmId/check-in', authenticateToken, verifyAccess, async (req, res) => {
  const { ukmId } = req.params;
  const { token, meetingId } = req.body;
  const userId = req.user.id;

  if (!token) {
    return res.status(400).json({ message: 'Kode token presensi wajib diisi' });
  }

  try {
    const cleanToken = token.trim().toUpperCase();
    let meeting;
    if (meetingId) {
      meeting = await Meeting.findOne({ where: { id: meetingId, ukmId } });
    } else {
      meeting = await Meeting.findOne({
        where: { ukmId, qrToken: cleanToken }
      });
    }

    if (!meeting) {
      return res.status(404).json({ message: 'Sesi pertemuan tidak ditemukan dengan token tersebut' });
    }

    if (meeting.qrToken && meeting.qrToken.toUpperCase() !== cleanToken) {
      return res.status(400).json({ message: 'Kode token presensi tidak cocok dengan sesi ini' });
    }

    // Check existing attendance
    let att = await Attendance.findOne({
      where: { meetingId: meeting.id, userId }
    });

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (att) {
      if (att.status === 'hadir') {
        return res.json({ message: 'Anda sudah tercatat hadir pada pertemuan ini! 🎉', attendance: att });
      }
      await att.update({
        status: 'hadir',
        keterangan: `Check-in Mandiri (${nowTime} WITA)`,
      });
    } else {
      att = await Attendance.create({
        ukmId,
        meetingId: meeting.id,
        userId,
        date: meeting.date,
        status: 'hadir',
        keterangan: `Check-in Mandiri (${nowTime} WITA)`,
      });
    }

    auditLog('STUDENT_CHECK_IN', userId, { ukmId, meetingId: meeting.id });
    res.json({
      message: `Presensi Berhasil! Anda tercatat HADIR pada ${meeting.title} ✅`,
      attendance: att,
      meeting
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal melakukan check-in presensi' });
  }
});

// PUT /api/attendance/:ukmId/meetings/:meetingId
router.put('/:ukmId/meetings/:meetingId', authenticateToken, authorizeRoles('manager', 'superadmin'), verifyAccess, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ where: { id: req.params.meetingId, ukmId: req.params.ukmId } });
    if (!meeting) return res.status(404).json({ message: 'Pertemuan tidak ditemukan' });

    await meeting.update(req.body);
    auditLog('MEETING_UPDATED', req.user.id, { meetingId: meeting.id });
    res.json(meeting);
  } catch (e) {
    res.status(500).json({ message: 'Gagal memperbarui pertemuan' });
  }
});

// DELETE /api/attendance/:ukmId/meetings/:meetingId
router.delete('/:ukmId/meetings/:meetingId', authenticateToken, authorizeRoles('manager', 'superadmin'), verifyAccess, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ where: { id: req.params.meetingId, ukmId: req.params.ukmId } });
    if (!meeting) return res.status(404).json({ message: 'Pertemuan tidak ditemukan' });

    await Attendance.destroy({ where: { meetingId: meeting.id } });
    await meeting.destroy();
    auditLog('MEETING_DELETED', req.user.id, { meetingId: req.params.meetingId });
    res.json({ message: 'Pertemuan berhasil dihapus' });
  } catch (e) {
    res.status(500).json({ message: 'Gagal menghapus pertemuan' });
  }
});

// ── 2. ROSTER ABSENSI PER PERTEMUAN (PENGELOLA MENGABSENKAN) ──────────────────

// GET /api/attendance/:ukmId/meetings/:meetingId/roster
router.get('/:ukmId/meetings/:meetingId/roster', authenticateToken, authorizeRoles('manager', 'superadmin'), verifyAccess, async (req, res) => {
  const { ukmId, meetingId } = req.params;
  try {
    const meeting = await Meeting.findOne({ where: { id: meetingId, ukmId } });
    if (!meeting) return res.status(404).json({ message: 'Pertemuan tidak ditemukan' });

    // Ambil seluruh anggota UKM
    const ukm = await Ukm.findByPk(ukmId, {
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'nim', 'name', 'prodi'],
        through: { attributes: [] },
      }],
    });

    const members = ukm.members || [];
    // Ambil data absensi yang sudah tercatat
    const attendances = await Attendance.findAll({ where: { meetingId } });
    // Ambil pengajuan izin untuk pertemuan/tanggal ini
    const leaveRequests = await LeaveRequest.findAll({
      where: {
        ukmId,
        date: meeting.date,
        status: 'approved',
      },
    });

    const roster = members.map(m => {
      const att = attendances.find(a => a.userId === m.id);
      const leave = leaveRequests.find(l => l.userId === m.id);
      let rawStatus = att ? att.status : (leave ? 'izin' : 'alpa');
      let status = rawStatus === 'alpha' ? 'alpa' : rawStatus;
      let keterangan = att?.keterangan || (leave ? `Izin: ${leave.reason}` : '');

      return {
        userId: m.id,
        nim: m.nim,
        name: m.name,
        prodi: m.prodi,
        status,
        keterangan,
        attendanceId: att?.id || null,
        hasApprovedLeave: Boolean(leave),
      };
    });

    res.json({ meeting, roster });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memuat lembar absensi' });
  }
});

// POST /api/attendance/:ukmId/meetings/:meetingId/roster
router.post('/:ukmId/meetings/:meetingId/roster', authenticateToken, authorizeRoles('manager', 'superadmin'), verifyAccess, async (req, res) => {
  const { ukmId, meetingId } = req.params;
  const { roster } = req.body; // array of { userId, status, keterangan }

  if (!Array.isArray(roster)) {
    return res.status(400).json({ message: 'Data roster tidak valid' });
  }

  try {
    const meeting = await Meeting.findOne({ where: { id: meetingId, ukmId } });
    if (!meeting) return res.status(404).json({ message: 'Pertemuan tidak ditemukan' });

    for (const item of roster) {
      const existing = await Attendance.findOne({
        where: { meetingId, userId: item.userId },
      });

      const itemStatus = item.status === 'alpha' ? 'alpa' : (item.status || 'alpa');
      if (existing) {
        await existing.update({
          status: itemStatus,
          keterangan: item.keterangan || null,
          date: meeting.date,
        });
      } else {
        await Attendance.create({
          ukmId,
          meetingId,
          userId: item.userId,
          date: meeting.date,
          status: itemStatus,
          keterangan: item.keterangan || null,
        });
      }
    }

    auditLog('ATTENDANCE_BULK_SAVED', req.user.id, { meetingId, count: roster.length });
    res.json({ message: 'Presensi pertemuan berhasil disimpan!' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal menyimpan absensi' });
  }
});

// ── 3. PENGAJUAN IZIN BERHALANGAN HADIR MAHASISWA ────────────────────────────

// GET /api/attendance/:ukmId/leave-requests
router.get('/:ukmId/leave-requests', authenticateToken, verifyAccess, async (req, res) => {
  const { ukmId } = req.params;
  const user = req.user;
  const where = { ukmId };

  // Mahasiswa hanya bisa melihat pengajuan izinnya sendiri
  if (user.role === 'student') {
    where.userId = user.id;
  }

  try {
    const requests = await LeaveRequest.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nim', 'name', 'prodi'] },
        { model: Meeting, as: 'meeting', attributes: ['id', 'meetingNumber', 'title', 'date'] },
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (e) {
    res.status(500).json({ message: 'Gagal memuat daftar izin' });
  }
});

// POST /api/attendance/:ukmId/leave-requests (Mahasiswa mengajukan izin)
router.post('/:ukmId/leave-requests', authenticateToken, verifyAccess, async (req, res) => {
  const { ukmId } = req.params;
  const { date, meetingId, reason, attachment } = req.body;

  if (!date || !reason) {
    return res.status(400).json({ message: 'Tanggal dan alasan izin wajib diisi' });
  }

  try {
    const leave = await LeaveRequest.create({
      ukmId,
      userId: req.user.id,
      meetingId: meetingId || null,
      date,
      reason,
      attachment: attachment || null,
      status: 'pending',
    });

    auditLog('LEAVE_REQUESTED', req.user.id, { ukmId, leaveId: leave.id, date, reason });
    res.status(201).json(leave);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal mengajukan izin' });
  }
});

// PUT /api/attendance/:ukmId/leave-requests/:id/review (Pengelola menyetujui/menolak)
router.put('/:ukmId/leave-requests/:id/review', authenticateToken, authorizeRoles('manager', 'superadmin'), verifyAccess, async (req, res) => {
  const { id, ukmId } = req.params;
  const { status, reviewNotes } = req.body; // status: 'approved' | 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status review harus approved atau rejected' });
  }

  try {
    const leave = await LeaveRequest.findOne({ where: { id, ukmId } });
    if (!leave) return res.status(404).json({ message: 'Pengajuan izin tidak ditemukan' });

    await leave.update({
      status,
      reviewNotes: reviewNotes || null,
      reviewedBy: req.user.id,
    });

    // Jika disetujui, otomatis perbarui status absensi siswa menjadi 'izin'
    if (status === 'approved') {
      const meetingWhere = leave.meetingId ? { id: leave.meetingId } : { ukmId, date: leave.date };
      const meeting = await Meeting.findOne({ where: meetingWhere });

      const attWhere = {
        userId: leave.userId,
        ukmId,
        date: leave.date,
      };
      if (meeting) attWhere.meetingId = meeting.id;

      const existingAtt = await Attendance.findOne({ where: attWhere });
      if (existingAtt) {
        await existingAtt.update({ status: 'izin', keterangan: `Izin disetujui: ${leave.reason}` });
      } else {
        await Attendance.create({
          userId: leave.userId,
          ukmId,
          meetingId: meeting?.id || null,
          date: leave.date,
          status: 'izin',
          keterangan: `Izin disetujui: ${leave.reason}`,
        });
      }
    }

    auditLog('LEAVE_REVIEWED', req.user.id, { leaveId: id, status });
    res.json({ message: `Izin berhasil di-${status === 'approved' ? 'setujui' : 'tolak'}`, leave });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memproses review izin' });
  }
});

// ── 4. REKAP MAHASISWA (MELIHAT SEMUA PERTEMUAN BULANAN SECARA REAL-TIME) ──────

// GET /api/attendance/:ukmId/student-overview
router.get('/:ukmId/student-overview', authenticateToken, verifyAccess, async (req, res) => {
  const { ukmId } = req.params;
  const userId = req.user.id;

  try {
    // Ambil seluruh pertemuan di UKM ini
    const meetings = await Meeting.findAll({
      where: { ukmId },
      order: [['meetingNumber', 'ASC'], ['date', 'ASC']],
    });

    // Ambil data absensi milik mahasiswa ini
    const myAttendances = await Attendance.findAll({
      where: { ukmId, userId },
    });

    // Ambil pengajuan izin milik mahasiswa ini
    const myLeaves = await LeaveRequest.findAll({
      where: { ukmId, userId },
    });

    // Gabungkan per pertemuan
    const list = meetings.map(m => {
      const att = myAttendances.find(a => a.meetingId === m.id || a.date === m.date);
      const leave = myLeaves.find(l => l.meetingId === m.id || l.date === m.date);

      let status = 'belum_diabsen';
      let keterangan = '-';

      if (att) {
        status = att.status === 'alpha' ? 'alpa' : att.status; // 'hadir', 'izin', 'sakit', 'alpa'
        keterangan = att.keterangan || (status === 'hadir' ? 'Tercatat Hadir' : '-');
      } else if (leave) {
        if (leave.status === 'approved') {
          status = 'izin';
          keterangan = `Izin disetujui: ${leave.reason}`;
        } else if (leave.status === 'pending') {
          status = 'menunggu_persetujuan_izin';
          keterangan = `Menunggu persetujuan pengelola (${leave.reason})`;
        }
      }

      return {
        meetingId: m.id,
        meetingNumber: m.meetingNumber,
        title: m.title,
        date: m.date,
        time: m.time,
        location: m.location,
        agenda: m.agenda,
        qrToken: m.qrToken,
        isActive: m.isActive,
        myStatus: status,
        keterangan,
      };
    });

    const totalMeetings = meetings.length;
    const totalHadir = list.filter(x => x.myStatus === 'hadir').length;
    const totalIzin  = list.filter(x => x.myStatus === 'izin').length;
    const totalSakit = list.filter(x => x.myStatus === 'sakit').length;
    const totalAlpa  = list.filter(x => x.myStatus === 'alpa' || x.myStatus === 'alpha').length;
    const percentage = totalMeetings > 0 ? Math.round((totalHadir / totalMeetings) * 100) : 0;

    res.json({
      totalMeetings,
      totalHadir,
      totalIzin,
      totalSakit,
      totalAlpha: totalAlpa,
      totalAlpa,
      percentage,
      meetings: list,
      leaveRequests: myLeaves,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Gagal memuat rekap absensi mahasiswa' });
  }
});

module.exports = router;
