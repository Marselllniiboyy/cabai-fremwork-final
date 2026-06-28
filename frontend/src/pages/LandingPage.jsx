import { Link } from 'react-router-dom'

const FEATURES = [
  { icon: '🤖', title: 'Deteksi AI Akurat', desc: 'Model MLP + KMeans mendeteksi penyakit daun cabai secara otomatis dari foto. Hasil instan, akurat, dan terpercaya.' },
  { icon: '📱', title: 'Mobile-Friendly', desc: 'Dirancang untuk digunakan langsung di lapangan. Buka dari HP, foto daun, dan langsung dapatkan hasil deteksi.' },
  { icon: '🌾', title: 'Manajemen Lahan', desc: 'Kelola semua lahan pertanian Anda dalam satu tempat. Pantau riwayat penyakit per lahan dengan mudah.' },
  { icon: '📊', title: 'Dashboard Cerdas', desc: 'Visualisasi statistik deteksi, tingkat keparahan, dan distribusi penyakit dalam grafik yang mudah dipahami.' },
  { icon: '🔒', title: 'Aman & Terpercaya', desc: 'Sistem autentikasi aman dengan hak akses berbasis peran. Data Anda terlindungi sepenuhnya.' },
  { icon: '⚡', title: 'Hasil Instan', desc: 'Upload foto, sistem memproses dengan cepat dan memberikan hasil diagnosis beserta rekomendasi tingkat keparahan.' },
]

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="navbar-brand" style={{ flex: 1 }}>
          <div className="brand-icon">🌶️</div>
          CabaiDetect
        </div>
        <Link to="/login" className="btn btn-ghost btn-sm">Masuk</Link>
        <Link to="/register" className="btn btn-primary btn-sm">Daftar</Link>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span>🤖</span> Smart Farming · Living Lab
          </div>
          <h1>Deteksi Penyakit Daun Cabai dengan Kecerdasan Buatan</h1>
          <p>
            Upload foto daun cabai Anda dan dapatkan diagnosis penyakit secara instan.
            Sistem AI kami menganalisis gambar untuk mendeteksi jenis penyakit dan
            tingkat keparahannya, membantu petani bertindak cepat dan tepat.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-white">
              Mulai Gratis 🚀
            </Link>
            <Link to="/login" className="btn btn-outline-white">
              Sudah punya akun?
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <p className="section-label">✨ Fitur Unggulan</p>
        <h2 className="section-title">Semua yang Anda Butuhkan untuk<br />Pertanian Cerdas</h2>
        <div className="grid-3">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Siap Melindungi Tanaman Cabai Anda?</h2>
        <p>Bergabung dengan petani cerdas yang sudah menggunakan teknologi AI untuk pertanian yang lebih produktif.</p>
        <Link to="/register" className="btn btn-white">
          Daftar Sekarang — Gratis!
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2024 <span className="brand">CabaiDetect</span> · Smart Farming Living Lab · Pemrograman Web Framework</p>
      </footer>
    </div>
  )
}
