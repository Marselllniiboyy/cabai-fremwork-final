import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

function SevBadge({ level }) {
  const key = (level || '').toLowerCase()
  const map = { rendah: 'green', sedang: 'amber', tinggi: 'orange', kritis: 'red' }
  return <span className={`badge badge-${map[key] || 'gray'}`} style={{ fontSize: '0.9rem', padding: '4px 14px' }}>{level}</span>
}

function SevAdvice({ level }) {
  const key = (level || '').toLowerCase()
  const advice = {
    rendah: 'Tanaman terdeteksi aman. Tetap pantau kondisi secara berkala dan jaga kebersihan lahan.',
    sedang: 'Ada tanda penyakit awal. Segera lakukan pengendalian dini seperti pemangkasan daun yang terkena dan aplikasi fungisida ringan.',
    tinggi: 'Infeksi cukup parah! Segera lakukan tindakan pengendalian intensif. Pertimbangkan konsultasi dengan penyuluh pertanian.',
    kritis: '🚨 Kondisi KRITIS! Diperlukan penanganan segera. Isolasi tanaman yang terinfeksi dan hubungi ahli pertanian secepatnya.',
  }
  const colors = { rendah: 'var(--clr-primary-bg)', sedang: 'var(--clr-warning-bg)', tinggi: '#fff7ed', kritis: 'var(--clr-danger-bg)' }
  const border = { rendah: '#bbf7d0', sedang: '#fde68a', tinggi: '#fed7aa', kritis: '#fecaca' }
  return (
    <div style={{ background: colors[key] || 'var(--clr-surface-2)', border: `1px solid ${border[key] || 'var(--clr-border)'}`, borderRadius: 'var(--r-md)', padding: '12px 16px', fontSize: 'var(--fs-sm)', lineHeight: 1.6 }}>
      💡 {advice[key] || 'Pantau kondisi tanaman secara berkala.'}
    </div>
  )
}

export default function DeteksiDetailPage() {
  const { id } = useParams()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [detection, setDetection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    api.get(`/detections/${id}`)
      .then(r => setDetection(r.data))
      .catch(() => { toast('Data tidak ditemukan', 'error'); navigate('/deteksi') })
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    try {
      await api.delete(`/detections/${id}`)
      toast('Riwayat berhasil dihapus')
      navigate('/deteksi')
    } catch (_) { toast('Gagal menghapus', 'error') }
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div className="page-content animate-fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Link to="/deteksi" className="btn btn-ghost btn-sm">← Kembali</Link>
        <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(true)}>🗑️ Hapus</button>
      </div>

      {/* Image */}
      {detection?.image_path && (
        <div style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', marginBottom: 'var(--sp-4)', border: '1px solid var(--clr-border)' }}>
          <img
            src={`/storage/${detection.image_path}`}
            alt="Daun Cabai"
            style={{ width: '100%', maxHeight: 300, objectFit: 'contain', background: '#000' }}
            onError={e => { e.target.parentElement.style.display = 'none' }}
          />
        </div>
      )}

      {/* Main Result */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--sp-4)' }}>
          <span style={{ fontSize: 36 }}>🦠</span>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'var(--fs-2xl)', fontWeight: 800, color: 'var(--clr-text)' }}>
              {detection?.jenis_penyakit}
            </h1>
            <SevBadge level={detection?.tingkat_keparahan} />
          </div>
        </div>

        {/* Results Grid */}
        <div className="result-row">
          <span className="result-key">🌾 Lahan</span>
          <Link to={`/lahan/${detection?.lahan?.id}`} className="result-val text-primary">{detection?.lahan?.nama_lahan}</Link>
        </div>
        <div className="result-row">
          <span className="result-key">📅 Tanggal</span>
          <span className="result-val">{new Date(detection?.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="result-row">
          <span className="result-key">🎯 Confidence Score</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="conf-bar-bg" style={{ width: 80 }}>
              <div className="conf-bar" style={{ width: `${(detection?.confidence * 100).toFixed(0)}%` }} />
            </div>
            <span className="result-val">{((detection?.confidence || 0) * 100).toFixed(2)}%</span>
          </div>
        </div>
        <div className="result-row">
          <span className="result-key">📊 Cluster KMeans</span>
          <span className="result-val">Cluster {detection?.cluster}</span>
        </div>
        <div className="result-row">
          <span className="result-key">⚠️ Tingkat Keparahan</span>
          <span className={`result-val sev-${(detection?.tingkat_keparahan || '').toLowerCase()}`} style={{ fontWeight: 700, fontSize: 'var(--fs-base)' }}>
            {detection?.tingkat_keparahan}
          </span>
        </div>
      </div>

      {/* Saran */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 'var(--sp-3)' }}>💡 Saran Penanganan</h2>
        <SevAdvice level={detection?.tingkat_keparahan} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 'var(--sp-4)', flexWrap: 'wrap' }}>
        <Link to={`/deteksi/baru?lahan=${detection?.lahan?.id}`} className="btn btn-primary" style={{ flex: 1 }}>
          📷 Deteksi Ulang Lahan Ini
        </Link>
        <Link to={`/lahan/${detection?.lahan?.id}`} className="btn btn-secondary" style={{ flex: 1 }}>
          🌾 Lihat Lahan
        </Link>
      </div>

      {/* Delete Modal */}
      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="🗑️ Hapus Deteksi?"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setShowDelete(false)}>Batal</button>
            <button className="btn btn-danger" onClick={handleDelete}>Ya, Hapus</button>
          </>
        }
      >
        <p className="text-muted">Riwayat deteksi ini akan dihapus permanen dan tidak dapat dikembalikan.</p>
      </Modal>
    </div>
  )
}
