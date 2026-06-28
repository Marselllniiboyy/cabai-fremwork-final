export default function LoadingSpinner({ fullPage = false, text = 'Memuat...' }) {
  if (fullPage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60dvh', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" />
        <p style={{ color: 'var(--clr-text-2)', fontSize: 'var(--fs-sm)' }}>{text}</p>
      </div>
    )
  }
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  )
}
