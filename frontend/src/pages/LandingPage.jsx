import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Brain, Smartphone, Sprout, LayoutDashboard, Shield, Zap, ArrowRight } from 'lucide-react'

const FEATURES = [
  { icon: Brain, title: 'Deteksi AI Akurat', desc: 'Model MLP + KMeans mendeteksi penyakit daun cabai secara otomatis dari foto. Hasil instan, akurat, dan terpercaya.' },
  { icon: Smartphone, title: 'Mobile-Friendly', desc: 'Dirancang untuk digunakan langsung di lapangan. Buka dari HP, foto daun, dan langsung dapatkan hasil deteksi.' },
  { icon: Sprout, title: 'Manajemen Lahan', desc: 'Kelola semua lahan pertanian Anda dalam satu tempat. Pantau riwayat penyakit per lahan dengan mudah.' },
  { icon: LayoutDashboard, title: 'Dashboard Cerdas', desc: 'Visualisasi statistik deteksi, tingkat keparahan, dan distribusi penyakit dalam grafik yang mudah dipahami.' },
  { icon: Shield, title: 'Aman & Terpercaya', desc: 'Sistem autentikasi aman dengan hak akses berbasis peran. Data Anda terlindungi sepenuhnya.' },
  { icon: Zap, title: 'Hasil Instan', desc: 'Upload foto, sistem memproses dengan cepat dan memberikan hasil diagnosis beserta rekomendasi tingkat keparahan.' },
]

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav" style={{ padding: 'var(--sp-3) var(--sp-4)', display: 'flex', alignItems: 'center' }}>
        <div className="navbar-brand" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/logo.jpg" 
            alt="Logo" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(22, 163, 74, 0.2)' }} 
          />
          <span style={{ fontSize: 'var(--fs-xl)', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--clr-text)' }}>CLF</span>
        </div>
        <Link to="/login" className="btn btn-ghost btn-sm">Masuk</Link>
        <Link to="/register" className="btn btn-primary btn-sm">Daftar</Link>
      </nav>

      {/* Hero */}
      <section 
        className="hero"
        style={{ 
          backgroundImage: `url('/hero-drone.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          padding: 'var(--sp-16) var(--sp-4) var(--sp-12)'
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.9) 0%, rgba(6, 95, 70, 0.85) 40%, rgba(2, 44, 34, 0.95) 100%)',
          zIndex: 1
        }}></div>

        <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles style={{ width: 14, height: 14 }} />
            <span>Smart Farming · Living Lab</span>
          </div>
          <h1>Deteksi Penyakit Daun Cabai dengan Kecerdasan Buatan</h1>
          <p>
            Upload foto daun cabai Anda dan dapatkan diagnosis penyakit secara instan.
            Sistem AI kami menganalisis gambar untuk mendeteksi jenis penyakit dan
            tingkat keparahannya, membantu petani bertindak cepat dan tepat.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-white" style={{ padding: '12px 24px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>Mulai Gratis</span>
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link to="/login" className="btn btn-outline-white" style={{ padding: '12px 24px' }}>
              Sudah punya akun?
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <p className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles style={{ width: 14, height: 14, color: 'var(--clr-primary)' }} />
          <span>Fitur Utama</span>
        </p>
        <h2 className="section-title">Semua yang Anda Butuhkan untuk<br />Pertanian Cerdas</h2>
        <div className="grid-3">
          {FEATURES.map(f => {
            const IconComponent = f.icon
            return (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComponent style={{ width: '24px', height: '24px' }} />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section 
        className="cta-section"
        style={{ 
          backgroundImage: `url('/hero-drone.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          padding: 'var(--sp-12) var(--sp-4)',
          color: '#fff',
          textAlign: 'center'
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(22, 163, 74, 0.85)',
          backdropFilter: 'blur(3px)',
          zIndex: 1
        }}></div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ color: '#fff', marginBottom: 'var(--sp-2)' }}>Siap Melindungi Tanaman Cabai Anda?</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 'var(--sp-6)', maxWidth: '600px', margin: '0 auto var(--sp-6)' }}>
            Bergabung dengan petani cerdas yang sudah menggunakan teknologi AI untuk pertanian yang lebih produktif.
          </p>
          <Link to="/register" className="btn btn-white" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px', fontWeight: 'bold', gap: '8px' }}>
            <span>Daftar Sekarang — Gratis!</span>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 <span className="brand">CLF</span> · Smart Farming Living Lab · Pemrograman Web Framework</p>
      </footer>
    </div>
  )
}
