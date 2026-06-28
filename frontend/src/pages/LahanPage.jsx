import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api/axios'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

export default function LahanPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [lahans, setLahans] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchLahans = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/lahans', { params: { search, page } })
      setLahans(data.data)
      setMeta(data)
    } catch (_) { toast('Gagal memuat data lahan', 'error') }
    setLoading(false)
  }, [search, page])

  useEffect(() => { fetchLahans() }, [fetchLahans])

  const openAdd = () => { setEditTarget(null); reset({}); setShowModal(true) }
  const openEdit = (l) => { setEditTarget(l); reset({ nama_lahan: l.nama_lahan, lokasi: l.lokasi, luas_m2: l.luas_m2 }); setShowModal(true) }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      if (editTarget) {
        await api.put(`/lahans/${editTarget.id}`, data)
        toast('Lahan berhasil diperbarui ✅')
      } else {
        await api.post('/lahans', data)
        toast('Lahan berhasil ditambahkan 🌱')
      }
      setShowModal(false)
      setPage(1)
      fetchLahans()
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan lahan'
      toast(msg, 'error')
    }
    setSubmitting(false)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/lahans/${deleteTarget.id}`)
      toast('Lahan berhasil dihapus')
      setDeleteTarget(null)
      fetchLahans()
    } catch (_) { toast('Gagal menghapus lahan', 'error') }
  }

  return (
    <div className="page-content animate-fade">
      <div className="page-header">
        <h1 className="page-title">🌱 Lahan Saya</h1>
        <p className="page-subtitle">Kelola semua lahan pertanian cabai Anda</p>
      </div>

      {/* Search bar */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="form-input"
            placeholder="Cari nama lahan..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            id="search-lahan"
          />
        </div>
        <button className="btn btn-primary hide-mobile" onClick={openAdd} id="btn-add-lahan">
          <span>＋</span> Tambah Lahan
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {lahans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌾</div>
              <p className="empty-title">{search ? 'Lahan tidak ditemukan' : 'Belum ada lahan'}</p>
              <p className="empty-desc">{search ? 'Coba kata kunci lain' : 'Tambahkan lahan pertanian pertama Anda'}</p>
              {!search && <button className="btn btn-primary" onClick={openAdd}>Tambah Lahan</button>}
            </div>
          ) : (
            <div className="grid-2">
              {lahans.map(l => (
                <div key={l.id} className="lahan-card">
                  <div className="lahan-card-header">
                    <div>
                      <div className="lahan-name">🌾 {l.nama_lahan}</div>
                      <div className="lahan-detail">📍 {l.lokasi || 'Lokasi tidak diset'}</div>
                      {l.luas_m2 && <div className="lahan-detail">📐 {Number(l.luas_m2).toLocaleString('id')} m²</div>}
                      <div className="lahan-detail" style={{ marginTop: 4 }}>
                        <span className="badge badge-gray">Oleh: {l.user?.name || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="lahan-actions">
                    <Link to={`/lahan/${l.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                      Detail
                    </Link>
                    <button className="btn-icon" onClick={() => openEdit(l)} title="Edit" aria-label="Edit lahan">✏️</button>
                    <button className="btn-icon danger" onClick={() => setDeleteTarget(l)} title="Hapus" aria-label="Hapus lahan">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          )}
        </>
      )}

      {/* FAB Mobile */}
      <button className="fab hide-desktop" onClick={openAdd} aria-label="Tambah lahan" id="fab-add-lahan">＋</button>

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editTarget ? '✏️ Edit Lahan' : '🌱 Tambah Lahan Baru'}
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
            <button className="btn btn-primary" form="lahan-form" type="submit" disabled={submitting} id="btn-simpan-lahan">
              {submitting ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Tambah Lahan'}
            </button>
          </>
        }
      >
        <form id="lahan-form" onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Nama Lahan *</label>
            <input className={`form-input ${errors.nama_lahan ? 'error' : ''}`} placeholder="Contoh: Lahan Utara A1"
              {...register('nama_lahan', { required: 'Nama lahan wajib diisi' })} />
            {errors.nama_lahan && <span className="form-error">{errors.nama_lahan.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Lokasi</label>
            <input className="form-input" placeholder="Contoh: Desa Sukamaju, Kec. Sukamakmur"
              {...register('lokasi')} />
          </div>
          <div className="form-group">
            <label className="form-label">Luas Lahan (m²)</label>
            <input type="number" className={`form-input ${errors.luas_m2 ? 'error' : ''}`} placeholder="Contoh: 500"
              {...register('luas_m2', { min: { value: 0, message: 'Luas tidak boleh negatif' } })} />
            {errors.luas_m2 && <span className="form-error">{errors.luas_m2.message}</span>}
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="🗑️ Hapus Lahan?"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Batal</button>
            <button className="btn btn-danger" onClick={handleDelete} id="btn-confirm-delete-lahan">Ya, Hapus</button>
          </>
        }
      >
        <p className="text-muted">Apakah Anda yakin ingin menghapus lahan <strong>{deleteTarget?.nama_lahan}</strong>? Seluruh riwayat deteksi lahan ini juga akan terhapus.</p>
      </Modal>
    </div>
  )
}
