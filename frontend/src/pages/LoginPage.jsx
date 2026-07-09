import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'

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
      toast(`Selamat datang, ${user.name}!`)
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
        <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src="/logo.jpg" 
            alt="Logo" 
            style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', marginBottom: '16px', boxShadow: 'var(--shadow-md)' }} 
          />
          <h1 className="auth-title">Masuk ke CLF</h1>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/lupa-password" style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-primary)', fontWeight: 600 }}>Lupa Password?</Link>
            </div>
            <div className="password-wrap">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                {...register('password', { required: 'Password wajib diisi' })}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPass(p => !p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {showPass ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
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
            {loading ? <><div className="spinner spinner-sm" /> Memproses...</> : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>Masuk</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </div>
            )}
          </button>
        </form>

        <p className="auth-divider">Belum punya akun?</p>
        <Link to="/register" className="btn btn-secondary btn-full" id="btn-go-register">Daftar Sekarang</Link>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <Link to="/" className="text-sm text-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
