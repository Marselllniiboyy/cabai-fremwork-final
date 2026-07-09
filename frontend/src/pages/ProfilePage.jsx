import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import api from '../api/axios'
import { User, Save, Key, Lock, Eye, EyeOff } from 'lucide-react'

import Modal from '../components/Modal'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)
  
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? `/storage/${user.avatar}` : null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formDataCache, setFormDataCache] = useState(null)

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  const { 
    register: registerPassword, 
    handleSubmit: handlePasswordSubmit, 
    formState: { errors: passwordErrors }, 
    reset: resetPasswordForm, 
    watch: watchPassword, 
    setError: setPasswordError 
  } = useForm()

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      alamat: user?.alamat || '',
      no_hp: user?.no_hp || '',
    }
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('File harus berupa gambar (JPG/PNG)', 'error')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast('Ukuran maksimal gambar adalah 2MB', 'error')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handlePreSubmit = (data) => {
    setFormDataCache(data)
    setShowConfirm(true)
  }

  const confirmSubmit = async () => {
    setShowConfirm(false)
    const data = formDataCache
    if (!data) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('email', data.email)
      if (data.alamat) formData.append('alamat', data.alamat)
      if (data.no_hp) formData.append('no_hp', data.no_hp)
      if (avatarFile) formData.append('avatar', avatarFile)

      const response = await api.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      
      updateUser(response.data.user)
      toast('Profil berhasil diperbarui!')
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal memperbarui profil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const onSubmitPassword = async (data) => {
    setPasswordLoading(true)
    try {
      await api.post('/change-password', {
        current_password: data.current_password,
        new_password: data.new_password,
        new_password_confirmation: data.new_password_confirmation
      })
      toast('Password Anda berhasil diubah!')
      setShowChangePassword(false)
      resetPasswordForm()
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengubah password'
      if (err.response?.data?.errors?.current_password) {
        setPasswordError('current_password', { message: err.response.data.errors.current_password[0] })
      } else {
        setPasswordError('root', { message: msg })
      }
      toast(msg, 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="page-content animate-fade">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User style={{ width: '28px', height: '28px', color: 'var(--clr-primary)' }} />
          <span>Edit Profil</span>
        </h1>
        <p className="page-subtitle">Kelola informasi data diri dan foto profil Anda</p>
      </div>

      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
          <div 
            style={{ 
              width: 100, height: 100, borderRadius: '50%', 
              background: 'var(--clr-primary-bg)', color: 'var(--clr-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 'bold', border: '2px solid var(--clr-primary)',
              overflow: 'hidden', cursor: 'pointer', position: 'relative'
            }}
            onClick={() => fileRef.current?.click()}
            title="Klik untuk mengubah foto"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
            ) : initials}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(0,0,0,0.5)', color: '#fff',
              fontSize: '0.65rem', textAlign: 'center', padding: '4px 0'
            }}>
              UBAH
            </div>
          </div>
          <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          <p className="text-sm text-muted" style={{ marginTop: 8 }}>Klik foto untuk mengubah</p>
        </div>

        <form onSubmit={handleSubmit(handlePreSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input 
              className={`form-input ${errors.name ? 'error' : ''}`}
              {...register('name', { required: 'Nama wajib diisi' })} 
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              {...register('email', { 
                required: 'Email wajib diisi',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' }
              })} 
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Nomor Handphone</label>
            <input 
              className="form-input"
              placeholder="0812xxxx"
              {...register('no_hp')} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Lengkap</label>
            <textarea 
              className="form-textarea"
              placeholder="Masukkan alamat lengkap..."
              {...register('alamat')} 
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 'var(--sp-4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <><div className="spinner spinner-sm" /> Menyimpan...</> : (
              <>
                <Save style={{ width: 16, height: 16 }} />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </form>
      </div>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save style={{ width: 20, height: 20, color: 'var(--clr-primary)' }} />
            <span>Konfirmasi Simpan</span>
          </div>
        }
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setShowConfirm(false)}>Batal</button>
            <button className="btn btn-primary" onClick={confirmSubmit}>Ya, Simpan</button>
          </>
        }
      >
        <p className="text-muted">Apakah Anda yakin ingin menyimpan perubahan pada profil Anda?</p>
      </Modal>

      <div className="card" style={{ maxWidth: 600, margin: 'var(--sp-5) auto 0 auto' }}>
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 6 }}>
          <Key style={{ width: 20, height: 20, color: 'var(--clr-primary)' }} />
          <span>Keamanan Akun</span>
        </h2>
        <p className="text-sm text-muted" style={{ marginBottom: 16 }}>Jaga keamanan akun Anda dengan mengubah password secara berkala</p>
        
        <button className="btn btn-secondary" onClick={() => setShowChangePassword(true)}>
          Ganti Password
        </button>
      </div>

      <Modal
        open={showChangePassword}
        onClose={() => { setShowChangePassword(false); resetPasswordForm(); }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key style={{ width: 20, height: 20, color: 'var(--clr-primary)' }} />
            <span>Ganti Password</span>
          </div>
        }
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => { setShowChangePassword(false); resetPasswordForm(); }} disabled={passwordLoading}>Batal</button>
            <button className="btn btn-primary" onClick={handlePasswordSubmit(onSubmitPassword)} disabled={passwordLoading}>
              {passwordLoading ? <div className="spinner spinner-sm" /> : 'Ubah Password'}
            </button>
          </>
        }
      >
        <form onSubmit={handlePasswordSubmit(onSubmitPassword)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginTop: 8 }}>
          <div className="form-group">
            <label className="form-label">Password Saat Ini</label>
            <div className="password-wrap">
              <input 
                type={showCurrentPass ? 'text' : 'password'}
                className={`form-input ${passwordErrors.current_password ? 'error' : ''}`}
                placeholder="Masukkan password saat ini"
                style={{ paddingLeft: 40 }}
                {...registerPassword('current_password', { required: 'Password saat ini wajib diisi' })}
              />
              <Lock style={{ position: 'absolute', left: 14, top: 13, width: 18, height: 18, color: 'var(--clr-text-3)' }} />
              <button type="button" className="password-toggle" onClick={() => setShowCurrentPass(p => !p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {showCurrentPass ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
              </button>
            </div>
            {passwordErrors.current_password && <span className="form-error">{passwordErrors.current_password.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password Baru</label>
            <div className="password-wrap">
              <input 
                type={showNewPass ? 'text' : 'password'}
                className={`form-input ${passwordErrors.new_password ? 'error' : ''}`}
                placeholder="Minimal 8 karakter"
                style={{ paddingLeft: 40 }}
                {...registerPassword('new_password', { 
                  required: 'Password baru wajib diisi',
                  minLength: { value: 8, message: 'Password minimal 8 karakter' }
                })}
              />
              <Lock style={{ position: 'absolute', left: 14, top: 13, width: 18, height: 18, color: 'var(--clr-text-3)' }} />
              <button type="button" className="password-toggle" onClick={() => setShowNewPass(p => !p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {showNewPass ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
              </button>
            </div>
            {passwordErrors.new_password && <span className="form-error">{passwordErrors.new_password.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Konfirmasi Password Baru</label>
            <div className="password-wrap">
              <input 
                type={showConfirmPass ? 'text' : 'password'}
                className={`form-input ${passwordErrors.new_password_confirmation ? 'error' : ''}`}
                placeholder="Ulangi password baru"
                style={{ paddingLeft: 40 }}
                {...registerPassword('new_password_confirmation', { 
                  required: 'Konfirmasi password wajib diisi',
                  validate: v => v === watchPassword('new_password') || 'Konfirmasi password tidak cocok'
                })}
              />
              <Lock style={{ position: 'absolute', left: 14, top: 13, width: 18, height: 18, color: 'var(--clr-text-3)' }} />
              <button type="button" className="password-toggle" onClick={() => setShowConfirmPass(p => !p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {showConfirmPass ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
              </button>
            </div>
            {passwordErrors.new_password_confirmation && <span className="form-error">{passwordErrors.new_password_confirmation.message}</span>}
          </div>

          {passwordErrors.root && (
            <div style={{ background: 'var(--clr-danger-bg)', color: 'var(--clr-danger)', padding: '12px 16px', borderRadius: 'var(--r-md)', fontSize: 'var(--fs-sm)' }}>
              {passwordErrors.root.message}
            </div>
          )}
        </form>
      </Modal>
    </div>
  )
}
