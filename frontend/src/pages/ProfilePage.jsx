import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import api from '../api/axios'
import { User, Save } from 'lucide-react'

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
    </div>
  )
}
