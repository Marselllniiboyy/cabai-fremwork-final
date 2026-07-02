import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { getDiseaseTranslation } from '../utils/diseaseHelper'
import { LayoutDashboard, Camera, Activity, Sprout, AlertTriangle, CheckCircle, Bug, ArrowRight, Search, FileText } from 'lucide-react'

const SEV_COLORS = {
  'Rendah': '#22c55e', 'Sedang': '#f59e0b', 'Tinggi': '#f97316', 'Kritis': '#ef4444',
  'rendah': '#22c55e', 'sedang': '#f59e0b', 'tinggi': '#f97316', 'kritis': '#ef4444',
}
const PIE_COLORS = ['#16a34a','#22c55e','#4ade80','#86efac','#f59e0b','#ef4444','#f97316','#0ea5e9','#8b5cf6']

function SevBadge({ level }) {
  const key = (level || '').toLowerCase()
  const map = { rendah: 'green', sedang: 'amber', tinggi: 'orange', kritis: 'red' }
  return <span className={`badge badge-${map[key] || 'gray'}`}>{level}</span>
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [summary, setSummary] = useState(null)
  const [lahans, setLahans] = useState([])
  const [recentDetections, setRecentDetections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sRes, lRes, dRes] = await Promise.all([
          api.get('/detections/summary'),
          api.get('/lahans?per_page=5'),
          api.get('/detections?per_page=5'),
        ])
        setSummary(sRes.data)
        setLahans(lRes.data.data || [])
        setRecentDetections(dRes.data.data || [])
      } catch (_) {}
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <LoadingSpinner fullPage />

  const sevData = (summary?.per_keparahan || []).map(d => ({
    name: d.tingkat_keparahan,
    value: Number(d.total),
    fill: SEV_COLORS[d.tingkat_keparahan] || '#94a3b8'
  }))

  const penyakitData = (summary?.per_penyakit || []).map(d => {
    const trans = getDiseaseTranslation(d.jenis_penyakit)
    return {
      name: `${trans.en} / ${trans.id}`,
      total: Number(d.total),
    }
  })

  return (
    <div className="page-content animate-fade">
      {/* Header */}
      <div className="page-header flex-between flex-wrap gap-3">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutDashboard style={{ width: '28px', height: '28px', color: 'var(--clr-primary)' }} />
            <span>Dashboard</span>
          </h1>
          <p className="page-subtitle">Selamat datang, <strong>{user?.name}</strong>! {isAdmin ? '(Admin)' : ''}</p>
        </div>
        <Link to="/deteksi/baru" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Camera style={{ width: '18px', height: '18px' }} />
          <span>Deteksi Baru</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon green" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search style={{ width: 22, height: 22 }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{summary?.total_deteksi ?? 0}</div>
            <div className="stat-label">Total Deteksi</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sprout style={{ width: 22, height: 22 }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{lahans.length}</div>
            <div className="stat-label">Lahan Aktif</div>
          </div>
        </div>
        {sevData.find(s => s.name?.toLowerCase() === 'kritis') ? (
          <div className="stat-card">
            <div className="stat-icon red" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle style={{ width: 22, height: 22 }} />
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--clr-danger)' }}>
                {sevData.find(s => s.name?.toLowerCase() === 'kritis')?.value ?? 0}
              </div>
              <div className="stat-label">Tingkat Kritis</div>
            </div>
          </div>
        ) : (
          <div className="stat-card">
            <div className="stat-icon green" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle style={{ width: 22, height: 22 }} />
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--clr-primary)' }}>Aman</div>
              <div className="stat-label">Status Tanaman</div>
            </div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-icon amber" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bug style={{ width: 22, height: 22 }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{penyakitData.length}</div>
            <div className="stat-label">Jenis Penyakit</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {summary?.total_deteksi > 0 && (
        <div className="chart-grid" style={{ marginBottom: 'var(--sp-5)' }}>
          {/* Pie Chart Keparahan */}
          <div className="card">
            <h2 className="card-title">Distribusi Keparahan</h2>
            {sevData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={sevData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={12}>
                    {sevData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Jumlah']} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted text-center" style={{ padding: 40 }}>Belum ada data</p>}
          </div>

          {/* Bar Chart Penyakit */}
          <div className="card">
            <h2 className="card-title">Per Jenis Penyakit</h2>
            {penyakitData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={penyakitData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" fontSize={10} tick={{ fill: 'var(--clr-text-2)' }} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="total" fill="var(--clr-primary)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted text-center" style={{ padding: 40 }}>Belum ada data</p>}
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div className="grid-2" style={{ marginBottom: 'var(--sp-5)' }}>
        {/* Lahan Terbaru */}
        <div className="card">
          <div className="flex-between mb-3">
            <h2 className="card-title" style={{ marginBottom: 0 }}>Lahan Saya</h2>
            <Link to="/lahan" className="text-sm text-primary font-bold" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>Lihat semua</span>
              <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
          {lahans.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sprout style={{ width: 36, height: 36, color: 'var(--clr-text-3)' }} />
              </div>
              <p className="empty-title">Belum ada lahan</p>
              <Link to="/lahan" className="btn btn-primary btn-sm">Tambah Lahan</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {lahans.map(l => (
                <Link key={l.id} to={`/lahan/${l.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--clr-border)', textDecoration: 'none' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--clr-primary-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sprout style={{ width: 18, height: 18, color: 'var(--clr-primary)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-bold text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.nama_lahan}</div>
                    <div className="text-sm text-muted">{l.lokasi || '—'} {l.luas_m2 ? `· ${l.luas_m2} m²` : ''}</div>
                  </div>
                  <span className="text-muted" style={{ fontSize: 12 }}>›</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Deteksi Terbaru */}
        <div className="card">
          <div className="flex-between mb-3">
            <h2 className="card-title" style={{ marginBottom: 0 }}>Deteksi Terbaru</h2>
            <Link to="/deteksi" className="text-sm text-primary font-bold" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>Lihat semua</span>
              <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
          {recentDetections.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search style={{ width: 36, height: 36, color: 'var(--clr-text-3)' }} />
              </div>
              <p className="empty-title">Belum ada deteksi</p>
              <Link to="/deteksi/baru" className="btn btn-primary btn-sm">Mulai Deteksi</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {recentDetections.map(d => (
                <Link key={d.id} to={`/deteksi/${d.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--clr-border)', textDecoration: 'none' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--clr-primary-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText style={{ width: '18px', height: '18px', color: 'var(--clr-primary)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-bold text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getDiseaseTranslation(d.jenis_penyakit).en}
                    </div>
                    <div className="text-xs text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{getDiseaseTranslation(d.jenis_penyakit).id}</span>
                      <span>•</span>
                      <span>{d.lahan?.nama_lahan || '—'}</span>
                    </div>
                  </div>
                  <SevBadge level={d.tingkat_keparahan} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="card text-center" style={{ background: 'linear-gradient(135deg, var(--clr-primary-bg), #dcfce7)', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--sp-6)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: 'var(--shadow-sm)' }}>
          <Camera style={{ width: '28px', height: '28px', color: 'var(--clr-primary)' }} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 8 }}>Deteksi Penyakit Sekarang</h3>
        <p className="text-muted text-sm" style={{ marginBottom: 16, maxWidth: '400px' }}>Upload foto daun cabai dan dapatkan diagnosis AI instan</p>
        <Link to="/deteksi/baru" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span>Mulai Deteksi</span>
          <ArrowRight style={{ width: 16, height: 16 }} />
        </Link>
      </div>
    </div>
  )
}
