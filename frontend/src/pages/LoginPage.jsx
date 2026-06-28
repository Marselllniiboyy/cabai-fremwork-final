import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors }, setError } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await login(data.email, data.password)
      toast(`Selamat datang, ${user.name}! 👋`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Email atau password salah'
      setError('root', { message: msg })
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade">
        <div className="auth-logo">
          <div className="auth-logo-icon">🌶️</div>
          <h1 className="auth-title">Masuk ke CabaiDetect</h1>
          <p className="auth-subtitle">Smart Farming · Deteksi Penyakit Daun Cabai</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="petani@example.com"
              {...register('email', {
                required: 'Email wajib diisi',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' }
              })}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-wrap">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                {...register('password', { required: 'Password wajib diisi' })}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPass(p => !p)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          {errors.root && (
            <div style={{ background: 'var(--clr-danger-bg)', color: 'var(--clr-danger)', padding: '12px 16px', borderRadius: 'var(--r-md)', fontSize: 'var(--fs-sm)' }}>
              {errors.root.message}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="btn-login">
            {loading ? <><div className="spinner spinner-sm" /> Memproses...</> : 'Masuk 🚀'}
          </button>
        </form>

        <p className="auth-divider">Belum punya akun?</p>
        <Link to="/register" className="btn btn-secondary btn-full" id="btn-go-register">Daftar Sekarang</Link>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" className="text-sm text-muted">← Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  )
}
