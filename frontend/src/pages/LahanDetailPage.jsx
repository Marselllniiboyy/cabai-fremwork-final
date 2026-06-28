import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

function SevBadge({ level }) {
  const key = (level || '').toLowerCase()
  const map = { rendah: 'green', sedang: 'amber', tinggi: 'orange', kritis: 'red' }
  return <span className={`badge badge-${map[key] || 'gray'}`}>{level}</span>
}

export default function LahanDetailPage() {
  const { id } = useParams()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [lahan, setLahan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    api.get(`/lahans/${id}`)
      .then(r => setLahan(r.data))
      .catch(() => { toast('Data tidak ditemukan', 'error'); navigate('/lahan') })
      .finally(() => setLoading(false))
  }, [id])

  const handleDeleteDetection = async () => {
    try {
      await api.delete(`/detections/${deleteTarget.id}`)
      toast('Riwayat deteksi berhasil dihapus')
      setDeleteTarget(null)
      const r = await api.get(`/lahans/${id}`)
      setLahan(r.data)
    } catch (_) { toast('Gagal menghapus', 'error') }
  }

  if (loading) return <LoadingSpinner fullPage />

  const detections = lahan?.detections || []

  return (
    <div className="page-content animate-fade">
      {/* Back */}
      <Link to="/lahan" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
        ← Kembali
      </Link>

      {/* Lahan Info */}
      <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <div className="flex-between flex-wrap gap-3">
          <div>
            <h1 className="page-title" style={{ fontSize: 'var(--fs-2xl)' }}>🌾 {lahan?.nama_lahan}</h1>
            <p className="page-subtitle">📍 {lahan?.lokasi || 'Lokasi tidak diset'}</p>
            {lahan?.luas_m2 && <p className="page-subtitle">📐 {Number(lahan.luas_m2).toLocaleString('id')} m²</p>}
          </div>
          <Link to={`/deteksi/baru?lahan=${id}`} className="btn btn-primary">
            📷 Deteksi Lahan Ini
          </Link>
        </div>

        <div className="divider" />
        <div className="grid-3">
          <div className="stat-card">
            <div className="stat-icon green">🔬</div>
            <div className="stat-info">
              <div className="stat-value">{detections.length}</div>
              <div className="stat-label">Total Deteksi</div>
            </div>
          </div>
          {detections.length > 0 && (
            <>
              <div className="stat-card">
                <div className="stat-icon amber">🦠</div>
                <div className="stat-info">
                  <div className="stat-value" style={{ fontSize: 'var(--fs-base)', fontWeight: 700 }}>
                    {detections[0]?.jenis_penyakit}
                  </div>
                  <div className="stat-label">Deteksi Terakhir</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon red">⚠️</div>
                <div className="stat-info">
                  <SevBadge level={detections[0]?.tingkat_keparahan} />
                  <div className="stat-label" style={{ marginTop: 4 }}>Tingkat Keparahan</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detection History */}
      <div className="card">
        <h2 className="card-title">📋 Riwayat Deteksi</h2>
        {detections.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div className="empty-icon">🔬</div>
            <p className="empty-title">Belum ada riwayat deteksi</p>
            <p className="empty-desc">Mulai deteksi penyakit pada lahan ini</p>
            <Link to={`/deteksi/baru?lahan=${id}`} className="btn btn-primary">Deteksi Sekarang</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {detections.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--clr-border)' }}>
                {d.image_path && (
                  <img
                    src={`/storage/${d.image_path}`}
                    alt="deteksi"
                    style={{ width: 56, height: 56, borderRadius: 'var(--r-md)', objectFit: 'cover', flexShrink: 0 }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-bold text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.jenis_penyakit}</div>
                  <div className="text-sm text-muted">{new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div style={{ marginTop: 4 }}>
                    <SevBadge level={d.tingkat_keparahan} />
                    <span className="badge badge-gray" style={{ marginLeft: 4 }}>{(d.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Link to={`/deteksi/${d.id}`} className="btn-icon" title="Detail">👁️</Link>
                  <button className="btn-icon danger" onClick={() => setDeleteTarget(d)} title="Hapus">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Delete */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="🗑️ Hapus Deteksi?"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Batal</button>
            <button className="btn btn-danger" onClick={handleDeleteDetection}>Ya, Hapus</button>
          </>
        }
      >
        <p className="text-muted">Apakah Anda yakin ingin menghapus riwayat deteksi ini?</p>
      </Modal>
    </div>
  )
}
