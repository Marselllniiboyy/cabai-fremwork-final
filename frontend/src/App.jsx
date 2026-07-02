import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/RouteGuards'

import AppLayout from './layouts/AppLayout'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import LahanPage from './pages/LahanPage'
import LahanDetailPage from './pages/LahanDetailPage'
import DeteksiPage from './pages/DeteksiPage'
import DeteksiBaruPage from './pages/DeteksiBaruPage'
import DeteksiDetailPage from './pages/DeteksiDetailPage'
import AdminUsersPage from './pages/AdminUsersPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

            {/* Protected — with AppLayout (Navbar + Sidebar) */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/lahan" element={<LahanPage />} />
              <Route path="/lahan/:id" element={<LahanDetailPage />} />
              <Route path="/deteksi" element={<DeteksiPage />} />
              <Route path="/deteksi/baru" element={<DeteksiBaruPage />} />
              <Route path="/deteksi/:id" element={<DeteksiDetailPage />} />

              {/* Admin Only */}
              <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
