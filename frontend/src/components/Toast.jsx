import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <ToastCtx.Provider value={{ toast: addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              {t.type === 'success' ? <CheckCircle style={{ width: 18, height: 18, color: 'var(--clr-primary)' }} /> : 
               t.type === 'error' ? <XCircle style={{ width: 18, height: 18, color: 'var(--clr-danger)' }} /> : 
               <AlertTriangle style={{ width: 18, height: 18, color: 'var(--clr-warning)' }} />}
            </span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
