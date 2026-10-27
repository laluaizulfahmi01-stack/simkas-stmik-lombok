// models/index.js - SIMKAS Models & Associations (Aligned with Visual ERD & PRD)
const { sequelize } = require('../config/database');
const User         = require('./User');
const Ukm          = require('./Ukm');
const Transaction  = require('./Transaction');
const UserUkm      = require('./UserUkm');
const Attendance   = require('./Attendance');
const Achievement  = require('./Achievement');
const Meeting      = require('./Meeting');
const LeaveRequest = require('./LeaveRequest');
const Application  = require('./Application');
const Dues         = require('./Dues');
const DuesPayment  = require('./DuesPayment');
const Event        = require('./Event');
const Document     = require('./Document');
const Inventory    = require('./Inventory');
const AuditLog     = require('./AuditLog');

// ── Student ↔ UKM (many-to-many through UserUkm) ─────────────────────────────
User.belongsToMany(Ukm, { through: UserUkm, as: 'ukms',    foreignKey: 'userId' });
Ukm.belongsToMany(User, { through: UserUkm, as: 'members', foreignKey: 'ukmId' });

// UserUkm direct associations (untuk akses jabatan & status keanggotaan)
User.hasMany(UserUkm, { foreignKey: 'userId', as: 'memberships' });
UserUkm.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Ukm.hasMany(UserUkm, { foreignKey: 'ukmId', as: 'memberships' });
UserUkm.belongsTo(Ukm, { foreignKey: 'ukmId', as: 'ukm' });

// ── Transactions ──────────────────────────────────────────────────────────────
Ukm.hasMany(Transaction,  { foreignKey: 'ukmId', as: 'transactions' });
Transaction.belongsTo(Ukm,  { foreignKey: 'ukmId', as: 'ukm' });
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Sesi Pertemuan (Meeting) ──────────────────────────────────────────────────
Ukm.hasMany(Meeting, { foreignKey: 'ukmId', as: 'meetings' });
Meeting.belongsTo(Ukm, { foreignKey: 'ukmId', as: 'ukm' });

// ── Attendance ────────────────────────────────────────────────────────────────
User.hasMany(Attendance, { foreignKey: 'userId', as: 'attendances' });
Attendance.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Ukm.hasMany(Attendance,  { foreignKey: 'ukmId',  as: 'attendances' });
Attendance.belongsTo(Ukm, { foreignKey: 'ukmId',  as: 'ukm' });
Meeting.hasMany(Attendance, { foreignKey: 'meetingId', as: 'attendances' });
Attendance.belongsTo(Meeting, { foreignKey: 'meetingId', as: 'meeting' });

// ── Pengajuan Izin (Leave Request) ────────────────────────────────────────────
User.hasMany(LeaveRequest, { foreignKey: 'userId', as: 'leaveRequests' });
LeaveRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Ukm.hasMany(LeaveRequest, { foreignKey: 'ukmId', as: 'leaveRequests' });
LeaveRequest.belongsTo(Ukm, { foreignKey: 'ukmId', as: 'ukm' });
Meeting.hasMany(LeaveRequest, { foreignKey: 'meetingId', as: 'leaveRequests' });
LeaveRequest.belongsTo(Meeting, { foreignKey: 'meetingId', as: 'meeting' });

// ── UKM Manager ───────────────────────────────────────────────────────────────
Ukm.belongsTo(User, { as: 'manager', foreignKey: 'managerId' });

// ── Capaian, E-Book & Foto ───────────────────────────────────────────────────
Ukm.hasMany(Achievement, { foreignKey: 'ukmId', as: 'achievements' });
Achievement.belongsTo(Ukm, { foreignKey: 'ukmId', as: 'ukm' });

// ── Pendaftaran UKM (Application) ────────────────────────────────────────────
User.hasMany(Application, { foreignKey: 'userId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'userId', as: 'applicant' });
Ukm.hasMany(Application, { foreignKey: 'ukmId', as: 'applications' });
Application.belongsTo(Ukm, { foreignKey: 'ukmId', as: 'ukm' });
User.hasMany(Application, { foreignKey: 'processedBy', as: 'processedApplications' });
Application.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

// ── Dues / Iuran ─────────────────────────────────────────────────────────────
Ukm.hasMany(Dues, { foreignKey: 'ukmId', as: 'dues' });
Dues.belongsTo(Ukm, { foreignKey: 'ukmId', as: 'ukm' });
User.hasMany(Dues, { foreignKey: 'createdBy', as: 'createdDues' });
Dues.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// ── DuesPayment / Pembayaran Iuran ───────────────────────────────────────────
Dues.hasMany(DuesPayment, { foreignKey: 'duesId', as: 'payments' });
DuesPayment.belongsTo(Dues, { foreignKey: 'duesId', as: 'dues' });
User.hasMany(DuesPayment, { foreignKey: 'userId', as: 'duesPayments' });
DuesPayment.belongsTo(User, { foreignKey: 'userId', as: 'member' });
Ukm.hasMany(DuesPayment, { foreignKey: 'ukmId', as: 'duesPayments' });
DuesPayment.belongsTo(Ukm, { foreignKey: 'ukmId', as: 'ukm' });
User.hasMany(DuesPayment, { foreignKey: 'recordedBy', as: 'recordedPayments' });
DuesPayment.belongsTo(User, { foreignKey: 'recordedBy', as: 'recorder' });

// ── Events / Agenda Kegiatan (FR-AGD-01..05) ─────────────────────────────────
Ukm.hasMany(Event, { foreignKey: 'ukmId', as: 'events' });
Event.belongsTo(Ukm, { foreignKey: 'ukmId', as: 'ukm' });
User.hasMany(Event, { foreignKey: 'createdBy', as: 'createdEvents' });
Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// ── Documents / Berkas Internal (FR-DOK-01..03) ──────────────────────────────
Ukm.hasMany(Document, { foreignKey: 'ukmId', as: 'documents' });
Document.belongsTo(Ukm, { foreignKey: 'ukmId', as: 'ukm' });
User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'uploadedDocuments' });
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// ── Inventories / Inventaris Sederhana (FR-INV-01..03) ────────────────────────
Ukm.hasMany(Inventory, { foreignKey: 'ukmId', as: 'inventories' });
Inventory.belongsTo(Ukm, { foreignKey: 'ukmId', as: 'ukm' });
User.hasMany(Inventory, { foreignKey: 'updatedBy', as: 'updatedInventories' });
Inventory.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// ── Audit Logs (FR-AUD-01..02) ────────────────────────────────────────────────
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Ukm,
  Transaction,
  UserUkm,
  Attendance,
  Achievement,
  Meeting,
  LeaveRequest,
  Application,
  Dues,
  DuesPayment,
  Event,
  Document,
  Inventory,
  AuditLog,
};
