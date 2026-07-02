import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { getDiseaseTranslation } from '../utils/diseaseHelper'
import { ArrowLeft, Sprout, MapPin, Maximize2, Camera, Search, Bug, AlertTriangle, History, Eye, Trash2 } from 'lucide-react'

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
      <Link to="/lahan" className="btn btn-ghost btn-sm" style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <ArrowLeft style={{ width: 14, height: 14 }} /> Kembali
      </Link>

      {/* Lahan Info */}
      <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <div className="flex-between flex-wrap gap-3">
          <div>
            <h1 className="page-title" style={{ fontSize: 'var(--fs-2xl)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sprout style={{ width: '24px', height: '24px', color: 'var(--clr-primary)' }} />
              <span>{lahan?.nama_lahan}</span>
            </h1>
            <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <MapPin style={{ width: 14, height: 14, color: 'var(--clr-text-3)' }} />
              <span>{lahan?.lokasi || 'Lokasi tidak diset'}</span>
            </p>
            {lahan?.luas_m2 && (
              <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <Maximize2 style={{ width: 14, height: 14, color: 'var(--clr-text-3)' }} />
                <span>{Number(lahan.luas_m2).toLocaleString('id')} m²</span>
              </p>
            )}
          </div>
          <Link to={`/deteksi/baru?lahan=${id}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Camera style={{ width: 18, height: 18 }} />
            <span>Deteksi Lahan Ini</span>
          </Link>
        </div>

        <div className="divider" />
        <div className="grid-3">
          <div className="stat-card">
            <div className="stat-icon green" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search style={{ width: 22, height: 22 }} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{detections.length}</div>
              <div className="stat-label">Total Deteksi</div>
            </div>
          </div>
          {detections.length > 0 && (
            <>
              <div className="stat-card">
                <div className="stat-icon amber" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bug style={{ width: 22, height: 22 }} />
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ fontSize: 'var(--fs-base)', fontWeight: 700 }}>
                    <div>{getDiseaseTranslation(detections[0]?.jenis_penyakit).en}</div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-text-2)', fontWeight: 500, marginTop: 4 }}>
                      {getDiseaseTranslation(detections[0]?.jenis_penyakit).id}
                    </div>
                  </div>
                  <div className="stat-label">Deteksi Terakhir</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon red" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle style={{ width: 22, height: 22 }} />
                </div>
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
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History style={{ width: 20, height: 20, color: 'var(--clr-primary)' }} />
          <span>Riwayat Deteksi</span>
        </h2>
        {detections.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div className="empty-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search style={{ width: 36, height: 36, color: 'var(--clr-text-3)' }} />
            </div>
            <p className="empty-title">Belum ada riwayat deteksi</p>
            <p className="empty-desc">Mulai deteksi penyakit pada lahan ini</p>
            <Link to={`/deteksi/baru?lahan=${id}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Camera style={{ width: 16, height: 16 }} /> Deteksi Sekarang</Link>
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
                  <div className="font-bold text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getDiseaseTranslation(d.jenis_penyakit).en}
                  </div>
                  <div className="text-xs text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                    {getDiseaseTranslation(d.jenis_penyakit).id}
                  </div>
                  <div className="text-xs text-muted" style={{ marginTop: 2 }}>{new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div style={{ marginTop: 4 }}>
                    <SevBadge level={d.tingkat_keparahan} />
                    <span className="badge badge-gray" style={{ marginLeft: 4 }}>{(d.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Link to={`/deteksi/${d.id}`} className="btn-icon" title="Detail" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Eye style={{ width: 16, height: 16 }} />
                  </Link>
                  <button className="btn-icon danger" onClick={() => setDeleteTarget(d)} title="Hapus" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 style={{ width: 16, height: 16 }} />
                  </button>
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
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 style={{ width: 20, height: 20, color: 'var(--clr-danger)' }} />
            <span>Hapus Deteksi?</span>
          </div>
        }
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
