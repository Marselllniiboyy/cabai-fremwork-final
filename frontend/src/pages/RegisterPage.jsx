import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function RegisterPage() {
  const { register: authRegister } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors }, setError, watch } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await authRegister({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
      toast(`Akun berhasil dibuat! Selamat datang, ${user.name} 🎉`)
      navigate('/dashboard')
    } catch (err) {
      const errors_be = err.response?.data?.errors
      if (errors_be) {
        Object.entries(errors_be).forEach(([field, msgs]) => {
          setError(field, { message: msgs[0] })
        })
      } else {
        setError('root', { message: err.response?.data?.message || 'Registrasi gagal' })
        toast(err.response?.data?.message || 'Registrasi gagal', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade">
        <div className="auth-logo">
          <div className="auth-logo-icon">🌶️</div>
          <h1 className="auth-title">Buat Akun Baru</h1>
          <p className="auth-subtitle">Bergabung dengan CabaiDetect Smart Farming</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Nama Lengkap</label>
            <input
              id="reg-name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Budi Santoso"
              {...register('name', { required: 'Nama wajib diisi', minLength: { value: 2, message: 'Nama minimal 2 karakter' } })}
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
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
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="password-wrap">
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Minimal 8 karakter"
                {...register('password', { required: 'Password wajib diisi', minLength: { value: 8, message: 'Password minimal 8 karakter' } })}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPass(p => !p)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Konfirmasi Password</label>
            <input
              id="reg-confirm"
              type={showPass ? 'text' : 'password'}
              className={`form-input ${errors.password_confirmation ? 'error' : ''}`}
              placeholder="Ulangi password"
              {...register('password_confirmation', {
                required: 'Konfirmasi password wajib diisi',
                validate: v => v === password || 'Password tidak cocok'
              })}
            />
            {errors.password_confirmation && <span className="form-error">{errors.password_confirmation.message}</span>}
          </div>

          {errors.root && (
            <div style={{ background: 'var(--clr-danger-bg)', color: 'var(--clr-danger)', padding: '12px 16px', borderRadius: 'var(--r-md)', fontSize: 'var(--fs-sm)' }}>
              {errors.root.message}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="btn-register">
            {loading ? <><div className="spinner spinner-sm" /> Membuat akun...</> : 'Daftar Sekarang 🎉'}
          </button>
        </form>

        <p className="auth-divider">Sudah punya akun?</p>
        <Link to="/login" className="btn btn-secondary btn-full">Masuk</Link>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" className="text-sm text-muted">← Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  )
}
