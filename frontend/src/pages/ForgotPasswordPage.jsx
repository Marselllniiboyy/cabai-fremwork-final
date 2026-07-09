import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useToast } from '../components/Toast'
import api from '../api/axios'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [debugUrl, setDebugUrl] = useState(null)

  const { register, handleSubmit, formState: { errors }, setError } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await api.post('/forgot-password', { email: data.email })
      setSuccess(true)
      toast(response.data.message)
      if (response.data.debug_url) {
        setDebugUrl(response.data.debug_url)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memproses permintaan'
      setError('email', { type: 'manual', message: msg })
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade" style={{ maxWidth: 440 }}>
        <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src="/logo.jpg" 
            alt="Logo" 
            style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', marginBottom: '16px', boxShadow: 'var(--shadow-md)' }} 
          />
          <h1 className="auth-title">Lupa Password</h1>
          <p className="auth-subtitle">Masukkan email Anda untuk menerima link reset password</p>
        </div>

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
            <div style={{ background: 'var(--clr-primary-bg)', color: 'var(--clr-primary)', border: '1px solid #bbf7d0', padding: '16px', borderRadius: 'var(--r-md)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <CheckCircle style={{ width: 20, height: 20, flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ display: 'block', marginBottom: 4 }}>Permintaan Berhasil!</strong>
                <span className="text-sm">Link reset password telah dikirim ke email Anda. Silakan periksa inbox (atau tab spam) email Anda.</span>
              </div>
            </div>

            {debugUrl && (
              <div style={{ background: 'var(--clr-warning-bg)', border: '1px solid #fde68a', padding: '16px', borderRadius: 'var(--r-md)' }}>
                <strong style={{ fontSize: 'var(--fs-sm)', display: 'block', color: 'var(--clr-warning)', marginBottom: 8 }}>Petunjuk Developer (Mode Lokal):</strong>
                <p className="text-xs text-muted" style={{ marginBottom: 12 }}>Karena mailer diatur ke log, Anda dapat menyalin tautan reset password langsung di bawah ini untuk mencoba:</p>
                <a 
                  href={debugUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary btn-sm btn-full"
                  style={{ display: 'inline-flex', textDecoration: 'none' }}
                >
                  Buka Tautan Reset Password
                </a>
              </div>
            )}

            <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: 8 }}>Kembali ke Login</Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Alamat Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="petani@example.com"
                  style={{ paddingLeft: 40 }}
                  {...register('email', {
                    required: 'Email wajib diisi',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' }
                  })}
                />
                <Mail style={{ position: 'absolute', left: 14, top: 13, width: 18, height: 18, color: 'var(--clr-text-3)' }} />
              </div>
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <><div className="spinner spinner-sm" /> Memproses...</> : 'Kirim Link Reset'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <Link to="/login" className="text-sm text-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft style={{ width: 14, height: 14 }} /> Kembali ke Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
