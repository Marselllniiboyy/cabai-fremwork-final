import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


export default function Navbar({ onMenuOpen }) {
  const { user } = useAuth()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <nav className="navbar">
      <button className="hamburger-btn" onClick={onMenuOpen} aria-label="Menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img 
          src="/logo.jpg" 
          alt="Logo" 
          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
        />
        <span className="hide-mobile" style={{ color: 'var(--clr-text)' }}>CLF</span>
      </div>
      <div className="navbar-spacer" />
      <NavLink to="/profile" className="navbar-avatar" title="Profil Saya" style={{ textDecoration: 'none' }}>
        {user?.avatar ? (
          <img src={`/storage/${user.avatar}`} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
        ) : (
          initials
        )}
      </NavLink>
    </nav>
  )
}
