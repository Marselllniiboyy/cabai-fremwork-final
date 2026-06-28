import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useToast } from '../components/Toast'

const STEPS = ['Pilih Lahan', 'Upload Foto', 'Hasil Deteksi']

function SevBadge({ level }) {
  const key = (level || '').toLowerCase()
  const map = { rendah: 'green', sedang: 'amber', tinggi: 'orange', kritis: 'red' }
  return <span className={`badge badge-${map[key] || 'gray'}`} style={{ fontSize: '1rem', padding: '4px 14px' }}>{level}</span>
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
    <div style={{ background: colors[key] || 'var(--clr-surface-2)', border: `1px solid ${border[key] || 'var(--clr-border)'}`, borderRadius: 'var(--r-md)', padding: '12px 16px', fontSize: 'var(--fs-sm)', lineHeight: 1.6, marginTop: 12 }}>
      💡 {advice[key] || 'Pantau kondisi tanaman secara berkala.'}
    </div>
  )
}

export default function DeteksiBaruPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(0)
  const [lahans, setLahans] = useState([])
  const [selectedLahan, setSelectedLahan] = useState(searchParams.get('lahan') || '')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    api.get('/lahans?per_page=100').then(r => setLahans(r.data.data || []))
  }, [])

  const handleFile = (file) => {
    if (!file?.type?.startsWith('image/')) { toast('File harus berupa gambar (JPG/PNG)', 'error'); return }
    if (file.size > 5 * 1024 * 1024) { toast('Ukuran gambar maksimal 5MB', 'error'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!selectedLahan) { toast('Pilih lahan terlebih dahulu', 'error'); return }
    if (!imageFile) { toast('Upload foto daun cabai terlebih dahulu', 'error'); return }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('lahan_id', selectedLahan)
      formData.append('image', imageFile)
      const { data } = await api.post('/detections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
      setStep(2)
      toast('Deteksi berhasil! ✅')
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mendeteksi. Pastikan ML service aktif.'
      toast(msg, 'error')
    }
    setLoading(false)
  }

  return (
    <div className="page-content animate-fade">
      <div className="page-header">
        <h1 className="page-title">📷 Deteksi Baru</h1>
        <p className="page-subtitle">Upload foto daun cabai untuk mendeteksi penyakit</p>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator" style={{ marginBottom: 'var(--sp-6)' }}>
        {STEPS.map((s, i) => (
          <>
            <div key={s} className={`step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
              {i < step ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && <div key={`line-${i}`} className={`step-line ${i < step ? 'done' : ''}`} />}
          </>
        ))}
      </div>
      {/* Step Label */}
      <p style={{ textAlign: 'center', fontWeight: 600, marginBottom: 'var(--sp-5)', color: 'var(--clr-text-2)' }}>
        {STEPS[step]}
      </p>

      {/* Step 0: Pilih Lahan */}
      {step === 0 && (
        <div className="card">
          <h2 className="card-title">Pilih Lahan yang Akan Dideteksi</h2>
          {lahans.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-icon">🌾</div>
              <p className="empty-title">Belum ada lahan</p>
              <p className="empty-desc">Tambahkan lahan terlebih dahulu sebelum melakukan deteksi</p>
              <button className="btn btn-primary" onClick={() => navigate('/lahan')}>Tambah Lahan</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
                {lahans.map(l => (
                  <label key={l.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: 'var(--sp-3) var(--sp-4)',
                    border: `2px solid ${selectedLahan == l.id ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                    borderRadius: 'var(--r-md)',
                    background: selectedLahan == l.id ? 'var(--clr-primary-bg)' : 'var(--clr-surface)',
                    cursor: 'pointer', transition: 'all var(--dur-fast)',
                  }}>
                    <input type="radio" name="lahan" value={l.id} checked={selectedLahan == l.id} onChange={e => setSelectedLahan(e.target.value)} style={{ display: 'none' }} />
                    <span style={{ fontSize: 24 }}>🌾</span>
                    <div style={{ flex: 1 }}>
                      <div className="font-bold">{l.nama_lahan}</div>
                      {l.lokasi && <div className="text-sm text-muted">📍 {l.lokasi}</div>}
                    </div>
                    {selectedLahan == l.id && <span style={{ color: 'var(--clr-primary)', fontSize: 20 }}>✓</span>}
                  </label>
                ))}
              </div>
              <button
                className="btn btn-primary btn-full"
                disabled={!selectedLahan}
                onClick={() => setStep(1)}
                id="btn-next-step1"
              >
                Lanjut → Upload Foto
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 1: Upload Foto */}
      {step === 1 && (
        <div className="card">
          <h2 className="card-title">Upload Foto Daun Cabai</h2>
          <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-4)' }}>
            Foto jelas, pencahayaan cukup, daun terlihat penuh. Format: JPG/PNG, maks 5MB.
          </p>

          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          >
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e => handleFile(e.target.files[0])} id="input-foto-daun" />
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="upload-preview" />
                <p className="text-sm text-primary" style={{ marginTop: 8, fontWeight: 600 }}>✅ {imageFile?.name}</p>
                <p className="text-sm text-muted">Klik untuk ganti foto</p>
              </>
            ) : (
              <>
                <div className="upload-icon">📷</div>
                <p className="upload-text">Ketuk untuk mengambil foto atau pilih dari galeri</p>
                <p className="upload-hint">JPG, PNG · Maks 5MB</p>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 'var(--sp-5)' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(0)}>← Kembali</button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={!imageFile || loading}
              onClick={handleSubmit}
              id="btn-submit-deteksi"
            >
              {loading ? (
                <><div className="spinner spinner-sm" /> Menganalisis AI...</>
              ) : '🔍 Analisis Sekarang'}
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', marginTop: 16, color: 'var(--clr-text-2)', fontSize: 'var(--fs-sm)' }}>
              <p>🤖 Model AI sedang menganalisis gambar...</p>
              <p style={{ marginTop: 4 }}>Harap tunggu beberapa saat</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Hasil */}
      {step === 2 && result && (
        <div className="animate-fade">
          <div className="result-card" style={{ marginBottom: 'var(--sp-5)' }}>
            {result.image_url ? (
              <img src={result.image_url} alt="Daun yang dideteksi" className="result-image" onError={e => { e.target.style.display='none' }} />
            ) : imagePreview && (
              <img src={imagePreview} alt="Daun yang dideteksi" className="result-image" />
            )}
            <div className="result-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>🦠</span>
                <div>
                  <div className="result-disease">{result.data?.jenis_penyakit}</div>
                  <SevBadge level={result.data?.tingkat_keparahan} />
                </div>
              </div>

              <div className="result-row">
                <span className="result-key">🎯 Confidence</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="conf-bar-bg" style={{ width: 80 }}>
                    <div className="conf-bar" style={{ width: `${(result.data?.confidence * 100).toFixed(0)}%` }} />
                  </div>
                  <span className="result-val">{((result.data?.confidence || 0) * 100).toFixed(2)}%</span>
                </div>
              </div>
              <div className="result-row">
                <span className="result-key">📊 Cluster KMeans</span>
                <span className="result-val">Cluster {result.data?.cluster}</span>
              </div>
              <div className="result-row">
                <span className="result-key">⚠️ Tingkat Keparahan</span>
                <span className={`result-val sev-${(result.data?.tingkat_keparahan || '').toLowerCase()}`}>
                  {result.data?.tingkat_keparahan}
                </span>
              </div>

              <SevAdvice level={result.data?.tingkat_keparahan} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setStep(0); setImageFile(null); setImagePreview(null); setResult(null) }}>
              📷 Deteksi Lagi
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/deteksi')}>
              📋 Lihat Riwayat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
