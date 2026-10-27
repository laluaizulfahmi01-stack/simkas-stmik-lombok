// src/pages/admin/UkmPage.jsx
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import ProPageHeader from '../../components/ProPageHeader';
import api from '../../api/axios';
import { useToast } from '../../components/Toast';
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdSchool,
  MdTerminal, MdAutoAwesome, MdTerrain, MdSportsSoccer
} from 'react-icons/md';

const EMPTY = { name: '', managerId: '' };

const getUkmVisual = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('tech') || n.includes('code') || n.includes('it')) {
    return {
      icon: <MdTerminal />,
      bg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
      shadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
      label: 'Teknologi & IT'
    };
  }
  if (n.includes('ceria') || n.includes('seni') || n.includes('musik') || n.includes('tari')) {
    return {
      icon: <MdAutoAwesome />,
      bg: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
      shadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
      label: 'Seni & Kreatif'
    };
  }
  if (n.includes('gumpala') || n.includes('alam') || n.includes('gunung')) {
    return {
      icon: <MdTerrain />,
      bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      shadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
      label: 'Pencinta Alam'
    };
  }
  if (n.includes('haluner') || n.includes('olahraga') || n.includes('futsal') || n.includes('basket')) {
    return {
      icon: <MdSportsSoccer />,
      bg: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
      shadow: '0 4px 12px rgba(234, 88, 12, 0.35)',
      label: 'Olahraga Kampus'
    };
  }
  return {
    icon: <MdSchool />,
    bg: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
    shadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
    label: 'Organisasi Kampus'
  };
};

export default function AdminUkmPage() {
  const [ukms, setUkms] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const toast = useToast();

  const load = () => Promise.all([api.get('/ukm'), api.get('/admin/users')]).then(([u, us]) => {
    setUkms(u.data); setUsers(us.data);
  });
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = u  => { setForm({ name: u.name, managerId: u.managerId || '' }); setEditId(u.id); setModal(true); };

  const submit = async e => {
    e.preventDefault();
    const payload = { name: form.name, managerId: form.managerId || null };
    try {
      if (editId) { await api.put(`/ukm/${editId}`, payload); toast('UKM diperbarui!', 'success'); }
      else        { await api.post('/ukm', payload);          toast('UKM ditambahkan!', 'success'); }
      setModal(false); load();
    } catch (e) { toast(e.response?.data?.message || 'Gagal', 'error'); }
  };

  const remove = async id => {
    if (!confirm('Hapus UKM ini?')) return;
    try { await api.delete(`/ukm/${id}`); toast('Dihapus!', 'success'); load(); }
    catch { toast('Gagal menghapus', 'error'); }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ProPageHeader
          title="Kelola UKM"
          subtitle="Daftar unit kegiatan mahasiswa resmi di lingkungan STMIK Lombok"
          pillBadge={`${ukms.length} UKM Terdaftar`}
          pillColor="indigo"
          actions={
            <button className="btn btn-primary btn-sm" onClick={openAdd} style={{ borderRadius: 9999, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MdAdd style={{ fontSize: 18 }} /> Tambah UKM
            </button>
          }
        />
        <div className="main-content">
          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Daftar Organisasi UKM</h3>
              <button className="btn btn-primary btn-sm" onClick={openAdd}><MdAdd /> Tambah UKM</button>
            </div>
            {ukms.length === 0
              ? <div className="empty-state"><div className="icon">🏫</div><p>Belum ada UKM. Tambahkan UKM pertama!</p></div>
              : <div className="table-wrap"><table>
                  <thead><tr><th>#</th><th>Nama UKM</th><th>Pengelola</th><th>Anggota</th><th>Aksi</th></tr></thead>
                  <tbody>{ukms.map((u, i) => {
                    const visual = getUkmVisual(u.name);
                    return (
                      <tr key={u.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 10,
                              background: visual.bg, boxShadow: visual.shadow,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: 18, flexShrink: 0
                            }}>
                              {visual.icon}
                            </div>
                            <div>
                              <div style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{u.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{visual.label}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {u.manager
                            ? <span className="badge badge-blue">{u.manager.name}</span>
                            : <span className="badge badge-red">Belum ada pengelola</span>}
                        </td>
                        <td>
                          <span className="badge badge-gray">{u.members?.length || 0} Mahasiswa</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)} title="Edit UKM"><MdEdit /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => remove(u.id)} title="Hapus UKM"><MdDelete /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}</tbody>
                </table></div>}
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editId ? 'Edit UKM' : 'Tambah UKM Baru'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Nama UKM</label>
                <input className="input" placeholder="Contoh: UKM Basket" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Pengelola (opsional)</label>
                <select className="input" value={form.managerId} onChange={e => setForm({ ...form, managerId: e.target.value })}>
                  <option value="">-- Pilih Pengelola --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.nim})</option>)}
                </select>
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
