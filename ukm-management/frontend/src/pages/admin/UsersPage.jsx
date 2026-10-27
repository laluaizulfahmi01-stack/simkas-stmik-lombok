// src/pages/admin/UsersPage.jsx
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import ProPageHeader from '../../components/ProPageHeader';
import api from '../../api/axios';
import { useToast } from '../../components/Toast';
import { MdAdd, MdEdit, MdDelete, MdClose, MdSearch } from 'react-icons/md';

const PRODI = ['Teknik Informatika', 'Sistem Informasi', 'Komputerisasi Akuntansi'];
const EMPTY = { nim: '', name: '', prodi: '', password: '', role: 'student' };
const ROLE_BADGE = { student: 'badge-blue', manager: 'badge-yellow', superadmin: 'badge-purple' };
const ROLE_LABEL = { student: 'Mahasiswa', manager: 'Pengelola', superadmin: 'Super Admin' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const toast = useToast();

  const load = () => api.get('/admin/users').then(r => { setUsers(r.data); setFiltered(r.data); });
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u => u.name.toLowerCase().includes(q) || u.nim.includes(q) || u.role.includes(q)));
  }, [search, users]);

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = u  => { setForm({ nim: u.nim, name: u.name, prodi: u.prodi, password: '', role: u.role }); setEditId(u.id); setModal(true); };

  const submit = async e => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    try {
      if (editId) { await api.put(`/admin/users/${editId}`, payload); toast('User diperbarui!', 'success'); }
      else        { await api.post('/admin/users', payload);           toast('User ditambahkan!', 'success'); }
      setModal(false); load();
    } catch (e) { toast(e.response?.data?.message || 'Gagal', 'error'); }
  };

  const remove = async id => {
    if (!confirm('Hapus user ini?')) return;
    try { await api.delete(`/admin/users/${id}`); toast('Dihapus!', 'success'); load(); }
    catch { toast('Gagal menghapus', 'error'); }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ProPageHeader
          title="Kelola Pengguna"
          subtitle="Daftar akun mahasiswa, pengelola UKM, dan administrator STMIK Lombok"
          pillBadge={`${users.length} Akun`}
          pillColor="indigo"
          actions={
            <button className="btn btn-primary btn-sm" onClick={openAdd} style={{ borderRadius: 9999, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MdAdd style={{ fontSize: 18 }} /> Tambah User
            </button>
          }
        />
        <div className="main-content">
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Daftar Pengguna</h3>
              <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
                <MdSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                <input className="input" placeholder="Cari nama / NIM..." style={{ paddingLeft: 36 }}
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-sm" onClick={openAdd}><MdAdd /> Tambah</button>
            </div>
            {filtered.length === 0
              ? <div className="empty-state"><div className="icon">👤</div><p>Tidak ada pengguna</p></div>
              : <div className="table-wrap"><table>
                  <thead><tr><th>#</th><th>Pengguna</th><th>NIM</th><th>Prodi</th><th>Role</th><th>Status Verifikasi</th><th>UKM</th><th>Aksi</th></tr></thead>
                  <tbody>{filtered.map((u, i) => (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                          ) : (
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                              {u.name}
                              {u.isVerified && <span style={{ color: '#10b981', display: 'inline-flex' }} title="Terverifikasi">✓</span>}
                            </div>
                            {u.email && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{u.nim}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.prodi}</td>
                      <td><span className={`badge ${ROLE_BADGE[u.role]}`}>{ROLE_LABEL[u.role]}</span></td>
                      <td>
                        {u.isVerified ? (
                          <span className="badge badge-green" style={{ fontSize: 11 }}>✓ Terverifikasi</span>
                        ) : u.verificationStatus === 'pending' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span className="badge badge-yellow" style={{ fontSize: 11 }}>Menunggu Review</span>
                            <button
                              className="btn btn-sm"
                              style={{ fontSize: 11, padding: '3px 8px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                              onClick={async () => {
                                try {
                                  await api.put(`/admin/verifications/${u.id}/approve`);
                                  toast(`Verifikasi ${u.name} berhasil disetujui! Foto KTM dihapus sesuai PRD.`, 'success');
                                  load();
                                } catch {
                                  toast('Gagal menyetujui verifikasi', 'error');
                                }
                              }}
                            >
                              Setujui KTM
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span className="badge" style={{ fontSize: 11, background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>Belum Verif</span>
                            {u.role === 'student' && (
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: 11, padding: '2px 6px', color: 'var(--primary)' }}
                                onClick={async () => {
                                  try {
                                    await api.put(`/admin/verifications/${u.id}/approve`);
                                    toast(`Akun ${u.name} berhasil diverifikasi!`, 'success');
                                    load();
                                  } catch {
                                    toast('Gagal memverifikasi', 'error');
                                  }
                                }}
                              >
                                Verif Manual
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {u.ukms?.map(uk => <span key={uk.id} className="badge badge-blue" style={{ fontSize: 10 }}>{uk.name}</span>)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)} title="Edit Data"><MdEdit /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(u.id)} title="Nonaktifkan User"><MdDelete /></button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table></div>}
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>NIM</label>
                  <input className="input" value={form.nim} onChange={e => setForm({ ...form, nim: e.target.value })} required disabled={!!editId} />
                </div>
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Program Studi</label>
                <select className="input" value={form.prodi} onChange={e => setForm({ ...form, prodi: e.target.value })} required>
                  <option value="">Pilih Prodi</option>
                  {PRODI.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="student">Mahasiswa</option>
                  <option value="manager">Pengelola UKM</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password {editId && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(kosongkan jika tidak diubah)</span>}</label>
                <input className="input" type="password" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required={!editId} placeholder={editId ? 'Isi untuk ganti password' : 'Buat password'} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Simpan' : 'Tambah'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
