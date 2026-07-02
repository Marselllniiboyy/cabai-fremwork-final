import React, { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { Users, Search, Award, RefreshCw, Trash2 } from 'lucide-react'

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [roleTarget, setRoleTarget] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users', { params: { search, role: roleFilter, page } })
      setUsers(data.data)
      setMeta(data)
    } catch (_) { toast('Gagal memuat data user', 'error') }
    setLoading(false)
  }, [search, roleFilter, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleteTarget.id}`)
      toast('User berhasil dihapus')
      setDeleteTarget(null)
      fetchUsers()
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal menghapus user', 'error')
    }
  }

  const handleRoleChange = async (newRole) => {
    try {
      await api.patch(`/admin/users/${roleTarget.id}/role`, { role: newRole })
      toast(`Role user ${roleTarget.name} diubah menjadi ${newRole}`)
      setRoleTarget(null)
      fetchUsers()
    } catch (_) { toast('Gagal mengubah role', 'error') }
  }

  return (
    <div className="page-content animate-fade">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users style={{ width: '28px', height: '28px', color: 'var(--clr-primary)' }} />
          <span>Manajemen User</span>
        </h1>
        <p className="page-subtitle">Kelola semua pengguna aplikasi CLF</p>
      </div>

      {/* Filters */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <span className="search-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Search style={{ width: 16, height: 16 }} />
          </span>
          <input
            className="form-input"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            id="search-user"
          />
        </div>
        <select
          className="form-select"
          style={{ height: 44, minWidth: 140 }}
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          id="filter-role"
        >
          <option value="">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="petani">Petani</option>
        </select>
      </div>

      {/* Stats */}
      {meta && (
        <div className="grid-4" style={{ marginBottom: 'var(--sp-4)' }}>
          <div className="stat-card">
            <div className="stat-icon green" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: 22, height: 22 }} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{meta.total || 0}</div>
              <div className="stat-label">Total User</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award style={{ width: 22, height: 22 }} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
              <div className="stat-label">Admin (Halaman Ini)</div>
            </div>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        <>
          {users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users style={{ width: 48, height: 48, strokeWidth: 1.5, color: 'var(--clr-text-3)' }} />
              </div>
              <p className="empty-title">Tidak ada user ditemukan</p>
            </div>
          ) : (
            <>
              {/* Mobile: Cards */}
              <div className="hide-desktop" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {users.map(u => (
                  <div key={u.id} className="card" style={{ padding: 'var(--sp-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="navbar-avatar" style={{ flexShrink: 0 }}>
                        {u.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                        <div className="text-sm text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                        <div style={{ marginTop: 4 }}>
                          <span className={`role-chip ${u.role}`}>{u.role}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        <button className="btn-icon" onClick={() => setRoleTarget(u)} title="Ubah Role" aria-label="Ubah role" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <RefreshCw style={{ width: 16, height: 16 }} />
                        </button>
                        {u.role !== 'admin' && (
                          <button className="btn-icon danger" onClick={() => setDeleteTarget(u)} title="Hapus" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 style={{ width: 16, height: 16 }} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted" style={{ marginTop: 8 }}>
                      Bergabung: {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table */}
              <div className="card hide-mobile" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrap" style={{ borderRadius: 0, border: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Bergabung</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id}>
                          <td className="text-muted">{(page - 1) * 15 + i + 1}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="navbar-avatar" style={{ width: 32, height: 32, fontSize: 'var(--fs-xs)' }}>
                                {u.name?.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-bold">{u.name}</span>
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td><span className={`role-chip ${u.role}`}>{u.role}</span></td>
                          <td>{new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn-icon" onClick={() => setRoleTarget(u)} title="Ubah Role" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <RefreshCw style={{ width: 16, height: 16 }} />
                              </button>
                              {u.role !== 'admin' && (
                                <button className="btn-icon danger" onClick={() => setDeleteTarget(u)} title="Hapus" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Trash2 style={{ width: 16, height: 16 }} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="pagination">
                  <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
                  <span className="text-sm text-muted">Hal {meta.current_page} / {meta.last_page}</span>
                  <button className="page-btn" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>Next ›</button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Delete Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 style={{ width: 20, height: 20, color: 'var(--clr-danger)' }} />
            <span>Hapus User?</span>
          </div>
        }
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Batal</button>
            <button className="btn btn-danger" onClick={handleDelete} id="btn-confirm-delete-user">Ya, Hapus</button>
          </>
        }
      >
        <p className="text-muted">Apakah Anda yakin ingin menghapus akun <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})? Tindakan ini tidak dapat dibatalkan.</p>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        open={!!roleTarget}
        onClose={() => setRoleTarget(null)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw style={{ width: 20, height: 20, color: 'var(--clr-primary)' }} />
            <span>Ubah Role User</span>
          </div>
        }
        actions={<button className="btn btn-ghost" onClick={() => setRoleTarget(null)}>Batal</button>}
      >
        <p className="text-muted" style={{ marginBottom: 16 }}>Ubah role untuk <strong>{roleTarget?.name}</strong>:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-primary btn-full" onClick={() => handleRoleChange('admin')} disabled={roleTarget?.role === 'admin'} id="btn-set-admin">
            Jadikan Admin {roleTarget?.role === 'admin' ? '(Saat ini)' : ''}
          </button>
          <button className="btn btn-secondary btn-full" onClick={() => handleRoleChange('petani')} disabled={roleTarget?.role === 'petani'} id="btn-set-petani">
            Jadikan Petani {roleTarget?.role === 'petani' ? '(Saat ini)' : ''}
          </button>
        </div>
      </Modal>
    </div>
  )
}
