import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { getDiseaseTranslation } from '../utils/diseaseHelper'
import { History, Camera, Search, FileText, Sprout, AlertTriangle, Eye, Trash2 } from 'lucide-react'

function SevBadge({ level }) {
  const key = (level || '').toLowerCase()
  const map = { rendah: 'green', sedang: 'amber', tinggi: 'orange', kritis: 'red' }
  return <span className={`badge badge-${map[key] || 'gray'}`}>{level}</span>
}

export default function DeteksiPage() {
  const { toast } = useToast()
  const [detections, setDetections] = useState([])
  const [lahans, setLahans] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ lahan_id: '', tingkat_keparahan: '' })
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchDetections = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, ...filters }
      if (!params.lahan_id) delete params.lahan_id
      if (!params.tingkat_keparahan) delete params.tingkat_keparahan
      const { data } = await api.get('/detections', { params })
      setDetections(data.data)
      setMeta(data)
    } catch (_) { toast('Gagal memuat data', 'error') }
    setLoading(false)
  }, [page, filters])

  useEffect(() => { fetchDetections() }, [fetchDetections])

  useEffect(() => {
    api.get('/lahans?per_page=100').then(r => setLahans(r.data.data || []))
  }, [])

  const handleDelete = async () => {
    try {
      await api.delete(`/detections/${deleteTarget.id}`)
      toast('Riwayat berhasil dihapus')
      setDeleteTarget(null)
      fetchDetections()
    } catch (_) { toast('Gagal menghapus', 'error') }
  }

  const SEV_OPTIONS = ['Rendah', 'Sedang', 'Tinggi', 'Kritis']

  return (
    <div className="page-content animate-fade">
      <div className="page-header flex-between flex-wrap gap-3">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History style={{ width: '28px', height: '28px', color: 'var(--clr-primary)' }} />
            <span>Riwayat Deteksi</span>
          </h1>
          <p className="page-subtitle">Semua hasil deteksi penyakit daun cabai Anda</p>
        </div>
        <Link to="/deteksi/baru" className="btn btn-primary hide-mobile" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Camera style={{ width: '18px', height: '18px' }} />
          <span>Deteksi Baru</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="search-bar">
        <select
          className="form-select"
          style={{ flex: 1, minWidth: 150, height: 44 }}
          value={filters.lahan_id}
          onChange={e => { setFilters(f => ({ ...f, lahan_id: e.target.value })); setPage(1) }}
          id="filter-lahan"
        >
          <option value="">Semua Lahan</option>
          {lahans.map(l => <option key={l.id} value={l.id}>{l.nama_lahan}</option>)}
        </select>

        <select
          className="form-select"
          style={{ flex: 1, minWidth: 150, height: 44 }}
          value={filters.tingkat_keparahan}
          onChange={e => { setFilters(f => ({ ...f, tingkat_keparahan: e.target.value })); setPage(1) }}
          id="filter-keparahan"
        >
          <option value="">Semua Keparahan</option>
          {SEV_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {(filters.lahan_id || filters.tingkat_keparahan) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ lahan_id: '', tingkat_keparahan: '' }); setPage(1) }}>
            Reset
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {detections.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <History style={{ width: 48, height: 48, strokeWidth: 1.5, color: 'var(--clr-text-3)' }} />
              </div>
              <p className="empty-title">Tidak ada data deteksi</p>
              <p className="empty-desc">Belum ada deteksi yang cocok dengan filter ini</p>
              <Link to="/deteksi/baru" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Camera style={{ width: 16, height: 16 }} /> Mulai Deteksi</Link>
            </div>
          ) : (
            <>
              {/* Mobile: Cards */}
              <div className="hide-desktop" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {detections.map(d => (
                  <div key={d.id} className="card" style={{ padding: 'var(--sp-3)' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      {d.image_path ? (
                        <img src={`/storage/${d.image_path}`} alt="" style={{ width: 64, height: 64, borderRadius: 'var(--r-md)', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display='none' }} />
                      ) : (
                        <div style={{ width: 64, height: 64, borderRadius: 'var(--r-md)', background: 'var(--clr-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText style={{ width: 24, height: 24, color: 'var(--clr-text-3)' }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {getDiseaseTranslation(d.jenis_penyakit).en}
                        </div>
                        <div className="text-xs text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                          {getDiseaseTranslation(d.jenis_penyakit).id}
                        </div>
                        <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 4 }}>
                          <Sprout style={{ width: 14, height: 14, color: 'var(--clr-text-3)' }} />
                          <span>{d.lahan?.nama_lahan || '—'}</span>
                        </div>
                        <div className="text-sm text-muted">{new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <SevBadge level={d.tingkat_keparahan} />
                          <span className="badge badge-gray">{(d.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        <Link to={`/deteksi/${d.id}`} className="btn-icon" title="Detail" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Eye style={{ width: 16, height: 16 }} />
                        </Link>
                        <button className="btn-icon danger" onClick={() => setDeleteTarget(d)} title="Hapus" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 style={{ width: 16, height: 16 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table */}
              <div className="card hide-mobile" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrap" style={{ borderRadius: 0, border: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Foto</th>
                        <th>Penyakit</th>
                        <th>Lahan</th>
                        <th>Keparahan</th>
                        <th>Confidence</th>
                        <th>Cluster</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detections.map(d => (
                        <tr key={d.id}>
                          <td>
                            {d.image_path ? (
                              <img src={`/storage/${d.image_path}`} alt="" style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', objectFit: 'cover' }} onError={e => { e.target.style.display='none' }} />
                            ) : (
                              <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'var(--clr-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText style={{ width: 16, height: 16, color: 'var(--clr-text-3)' }} />
                              </div>
                            )}
                          </td>
                           <td>
                             <div className="font-bold">{getDiseaseTranslation(d.jenis_penyakit).en}</div>
                             <div className="text-xs text-muted" style={{ marginTop: 2 }}>{getDiseaseTranslation(d.jenis_penyakit).id}</div>
                           </td>
                          <td>{d.lahan?.nama_lahan || '—'}</td>
                          <td><SevBadge level={d.tingkat_keparahan} /></td>
                          <td>
                            <div className="conf-bar-wrap">
                              <div className="conf-bar-bg"><div className="conf-bar" style={{ width: `${(d.confidence * 100).toFixed(0)}%` }} /></div>
                              <span className="conf-val">{(d.confidence * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                          <td><span className="badge badge-gray">K-{d.cluster}</span></td>
                          <td>{new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <Link to={`/deteksi/${d.id}`} className="btn-icon" title="Detail" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Eye style={{ width: 16, height: 16 }} />
                              </Link>
                              <button className="btn-icon danger" onClick={() => setDeleteTarget(d)} title="Hapus" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 style={{ width: 16, height: 16 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="pagination">
                  <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
                  <span className="text-sm text-muted">Hal {meta.current_page} / {meta.last_page}</span>
                  <button className="page-btn" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>Next ›</button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* FAB Mobile */}
      <Link to="/deteksi/baru" className="fab hide-desktop" aria-label="Deteksi baru" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Camera style={{ width: 24, height: 24 }} />
      </Link>

      {/* Confirm Delete */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 style={{ width: 20, height: 20, color: 'var(--clr-danger)' }} />
            <span>Hapus Riwayat Deteksi?</span>
          </div>
        }
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Batal</button>
            <button className="btn btn-danger" onClick={handleDelete} id="btn-confirm-delete-detection">Ya, Hapus</button>
          </>
        }
      >
        <p className="text-muted">Apakah Anda yakin ingin menghapus riwayat deteksi <strong>{deleteTarget ? getDiseaseTranslation(deleteTarget.jenis_penyakit).en : ''}</strong> ini?</p>
      </Modal>
    </div>
  )
}
