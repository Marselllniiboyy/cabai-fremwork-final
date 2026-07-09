import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useToast } from '../components/Toast'
import api from '../api/axios'
import { Eye, EyeOff, Lock, CheckCircle, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch, setError } = useForm({
    defaultValues: {
      email: email || '',
      token: token || '',
    }
  })

  const onSubmit = async (data) => {
    if (!data.token || !data.email) {
      toast('Tautan reset password tidak valid atau tidak lengkap', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/reset-password', {
        email: data.email,
        token: data.token,
        password: data.password,
        password_confirmation: data.password_confirmation
      })
      setSuccess(true)
      toast(response.data.message)
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mereset password'
      setError('root', { message: msg })
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const passwordVal = watch('password')

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade" style={{ maxWidth: 440 }}>
        <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src="/logo.jpg" 
            alt="Logo" 
            style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', marginBottom: '16px', boxShadow: 'var(--shadow-md)' }} 
          />
          <h1 className="auth-title">Atur Ulang Password</h1>
          <p className="auth-subtitle">Masukkan password baru Anda untuk memulihkan akun</p>
        </div>

        {!token || !email ? (
          <div style={{ background: 'var(--clr-danger-bg)', color: 'var(--clr-danger)', border: '1px solid #fecaca', padding: '16px', borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            <strong style={{ fontSize: 'var(--fs-sm)' }}>Tautan Tidak Valid</strong>
            <p className="text-xs text-muted" style={{ margin: 0, color: 'var(--clr-danger)' }}>Tautan reset password yang Anda buka tidak lengkap atau tidak valid. Silakan lakukan permintaan ulang.</p>
            <Link to="/lupa-password" className="btn btn-danger btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }}>Minta Tautan Baru</Link>
          </div>
        ) : success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
            <div style={{ background: 'var(--clr-primary-bg)', color: 'var(--clr-primary)', border: '1px solid #bbf7d0', padding: '16px', borderRadius: 'var(--r-md)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <CheckCircle style={{ width: 20, height: 20, flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ display: 'block', marginBottom: 4 }}>Password Berhasil Direset!</strong>
                <span className="text-sm">Password Anda telah berhasil diubah. Silakan gunakan password baru Anda untuk masuk ke sistem.</span>
              </div>
            </div>
            <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: 8 }}>Masuk Sekarang</Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Hidden Token & Email Fields */}
            <input type="hidden" {...register('token')} />
            <input type="hidden" {...register('email')} />

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password Baru</label>
              <div className="password-wrap">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Minimal 8 karakter"
                  style={{ paddingLeft: 40 }}
                  {...register('password', {
                    required: 'Password baru wajib diisi',
                    minLength: { value: 8, message: 'Password minimal 8 karakter' }
                  })}
                />
                <Lock style={{ position: 'absolute', left: 14, top: 13, width: 18, height: 18, color: 'var(--clr-text-3)' }} />
                <button type="button" className="password-toggle" onClick={() => setShowPass(p => !p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {showPass ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password_confirmation">Konfirmasi Password Baru</label>
              <div className="password-wrap">
                <input
                  id="password_confirmation"
                  type={showConfirmPass ? 'text' : 'password'}
                  className={`form-input ${errors.password_confirmation ? 'error' : ''}`}
                  placeholder="Ulangi password baru"
                  style={{ paddingLeft: 40 }}
                  {...register('password_confirmation', {
                    required: 'Konfirmasi password wajib diisi',
                    validate: v => v === passwordVal || 'Konfirmasi password tidak cocok'
                  })}
                />
                <Lock style={{ position: 'absolute', left: 14, top: 13, width: 18, height: 18, color: 'var(--clr-text-3)' }} />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPass(p => !p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {showConfirmPass ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
              {errors.password_confirmation && <span className="form-error">{errors.password_confirmation.message}</span>}
            </div>

            {errors.root && (
              <div style={{ background: 'var(--clr-danger-bg)', color: 'var(--clr-danger)', padding: '12px 16px', borderRadius: 'var(--r-md)', fontSize: 'var(--fs-sm)' }}>
                {errors.root.message}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <><div className="spinner spinner-sm" /> Mereset...</> : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>Reset Password</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </div>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
