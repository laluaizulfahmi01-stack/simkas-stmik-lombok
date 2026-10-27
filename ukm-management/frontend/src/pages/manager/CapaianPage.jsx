// src/pages/manager/CapaianPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import ProPageHeader from '../../components/ProPageHeader';
import api from '../../api/axios';
import { useToast } from '../../components/Toast';
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdWorkspacePremium,
  MdAutoStories, MdPhotoCamera, MdDownload, MdLink, MdImage,
  MdOutlineCloudUpload, MdNorthEast
} from 'react-icons/md';

const EMPTY = {
  title: '',
  category: 'capaian',
  description: '',
  year: new Date().getFullYear().toString(),
  imageUrl: '',
  fileUrl: '',
  fileSize: '',
  author: '',
};

export default function ManagerCapaianPage() {
  const { user } = useAuth();
  const [ukms, setUkms] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get('/ukm').then(r => {
      const mine = r.data.filter(u => Number(u.managerId) === Number(user?.id));
      const list = (mine.length || user?.role === 'manager') ? (mine.length ? mine : r.data) : r.data;
      setUkms(list);
      if (list.length) setActiveId(list[0].id);
    });
  }, [user]);

  const load = () => {
    if (!activeId) return;
    setLoading(true);
    api.get(`/ukm/${activeId}/achievements`)
      .then(r => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [activeId]);

  const openAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setModal(true);
  };

  const openEdit = item => {
    setForm({
      title: item.title,
      category: item.category,
      description: item.description || '',
      year: item.year || '',
      imageUrl: item.imageUrl || '',
      fileUrl: item.fileUrl || '',
      fileSize: item.fileSize || '',
      author: item.author || '',
    });
    setEditId(item.id);
    setModal(true);
  };

  const submit = async e => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/ukm/${activeId}/achievements/${editId}`, form);
        toast('Data berhasil diperbarui! ✨', 'success');
      } else {
        await api.post(`/ukm/${activeId}/achievements`, form);
        toast('Data capaian / e-book berhasil ditambahkan! 🚀', 'success');
      }
      setModal(false);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal menyimpan data', 'error');
    }
  };

  const remove = async id => {
    if (!confirm('Yakin ingin menghapus item ini?')) return;
    try {
      await api.delete(`/ukm/${activeId}/achievements/${id}`);
      toast('Item berhasil dihapus', 'success');
      load();
    } catch {
      toast('Gagal menghapus', 'error');
    }
  };

  const activeUkm = ukms.find(u => u.id === activeId);

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ProPageHeader
          title="Kelola Capaian & E-Book"
          subtitle={`Publikasikan prestasi, modul digital & dokumentasi ${activeUkm?.name || 'UKM STMIK Lombok'}`}
          pillBadge="Arsip Digital"
          pillColor="indigo"
          actions={
            <button
              className="btn btn-primary"
              onClick={openAdd}
              style={{ borderRadius: 12, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
            >
              <MdAdd style={{ fontSize: 20 }} /> Tambah Konten Baru
            </button>
          }
          subbar={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Pilih UKM:</span>
              <div className="ukm-switcher" style={{ margin: 0 }}>
                {ukms.map(u => (
                  <button
                    key={u.id}
                    className={`ukm-tab${activeId === u.id ? ' active' : ''}`}
                    onClick={() => setActiveId(u.id)}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </div>
          }
        />

        <div className="main-content">
          <div className="card" style={{ padding: '24px 28px', borderRadius: 20 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
                }}>
                  <MdWorkspacePremium />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Koleksi Karya & Prestasi</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                    Total {items.length} materi terdaftar untuk {activeUkm?.name}
                  </p>
                </div>
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={openAdd}
                style={{ borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <MdAdd /> Tambah Konten
              </button>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="icon">⏳</div>
                <p>Memuat data...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🏆</div>
                <p>Belum ada capaian atau e-book yang ditambahkan. Klik tombol di atas untuk memulai!</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cover / Foto</th>
                      <th>Judul & Penulis</th>
                      <th>Kategori</th>
                      <th>Tahun</th>
                      <th>File E-Book</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ width: 80 }}>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              style={{ width: 60, height: 44, objectFit: 'cover', borderRadius: 8 }}
                            />
                          ) : (
                            <div style={{ width: 60, height: 44, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <MdImage style={{ color: 'var(--text-muted)' }} />
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.author || '-'}</div>
                        </td>
                        <td>
                          <span className={`badge ${item.category === 'ebook' ? 'badge-blue' : item.category === 'capaian' ? 'badge-yellow' : 'badge-purple'}`}>
                            {item.category === 'ebook' ? '📖 E-Book' : item.category === 'capaian' ? '🏆 Capaian' : '📷 Foto'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{item.year}</td>
                        <td>
                          {item.fileUrl ? (
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px 10px', fontSize: 11 }}
                            >
                              <MdDownload /> {item.fileSize || 'PDF'}
                            </a>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)} title="Edit Konten">
                              <MdEdit />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => remove(item.id)} title="Hapus Konten">
                              <MdDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Konten UKM' : 'Tambah Capaian / E-Book Baru'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>
                <MdClose />
              </button>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Judul Capaian / Judul E-Book</label>
                <input
                  className="input"
                  placeholder="Contoh: Modul Dasar Pemrograman Web 2026"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    className="input"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="capaian">🏆 Capaian & Prestasi</option>
                    <option value="ebook">📖 E-Book & Modul Bacaan</option>
                    <option value="foto_kegiatan">📷 Foto Dokumentasi Kegiatan</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tahun</label>
                  <input
                    className="input"
                    placeholder="2026"
                    value={form.year}
                    onChange={e => setForm({ ...form, year: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Penulis / Tim Pelaksana</label>
                <input
                  className="input"
                  placeholder="Contoh: Divisi Litbang / Tim Futsal Ceria"
                  value={form.author}
                  onChange={e => setForm({ ...form, author: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Deskripsi / Sinopsis E-Book</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Ceritakan detail prestasi atau ringkasan materi e-book..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label>URL Foto / Gambar Sampul E-Book</label>
                <input
                  className="input"
                  placeholder="https://images.unsplash.com/..."
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Link File E-Book / Dokumen PDF (opsional)</label>
                  <input
                    className="input"
                    placeholder="https://.../modul.pdf"
                    value={form.fileUrl}
                    onChange={e => setForm({ ...form, fileUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Ukuran File</label>
                  <input
                    className="input"
                    placeholder="Contoh: 4.5 MB"
                    value={form.fileSize}
                    onChange={e => setForm({ ...form, fileSize: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editId ? 'Simpan Perubahan' : 'Tambah Konten'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
