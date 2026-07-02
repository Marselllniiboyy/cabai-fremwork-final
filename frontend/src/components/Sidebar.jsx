import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Modal from './Modal'
import { LayoutDashboard, Sprout, History, Camera, Users, User, LogOut } from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/lahan', icon: Sprout, label: 'Lahan Saya' },
  { to: '/deteksi', icon: History, label: 'Riwayat Deteksi' },
  { to: '/deteksi/baru', icon: Camera, label: 'Deteksi Baru' },
]

export default function Sidebar({ open, onClose }) {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)

  const confirmLogout = async () => {
    setShowLogout(false)
    await logout()
    navigate('/login')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <span>CLF</span>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Tutup menu">✕</button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Menu Utama</p>
          {NAV.map(({ to, icon: IconComponent, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <IconComponent style={{ width: '18px', height: '18px' }} />
              </span>
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className="sidebar-section-label" style={{ marginTop: 12 }}>Admin</p>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Users style={{ width: '18px', height: '18px' }} />
                </span>
                Manajemen User
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="navbar-avatar">
              {user?.avatar ? (
                <img src={`/storage/${user.avatar}`} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
              ) : (
                initials
              )}
            </div>
            <div className="user-info-text">
              <div className="user-info-name">{user?.name}</div>
              <div className="user-info-role">{user?.role}</div>
            </div>
          </div>
          <NavLink to="/profile" className="btn btn-secondary btn-full mb-3" onClick={onClose} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <User style={{ width: 16, height: 16 }} /> Edit Profil
          </NavLink>
          <button className="btn btn-ghost btn-full" onClick={() => setShowLogout(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogOut style={{ width: 16, height: 16 }} /> Keluar
          </button>
        </div>
      </aside>

      <Modal
        open={showLogout}
        onClose={() => setShowLogout(false)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut style={{ width: '20px', height: '20px', color: 'var(--clr-danger)' }} />
            <span>Konfirmasi Keluar</span>
          </div>
        }
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setShowLogout(false)}>Batal</button>
            <button className="btn btn-danger" onClick={confirmLogout}>Ya, Keluar</button>
          </>
        }
      >
        <p className="text-muted">Apakah Anda yakin ingin keluar dari aplikasi?</p>
      </Modal>
    </>
  )
}
