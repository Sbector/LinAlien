import { lazy, Suspense } from 'react'

const ARPortalScene = lazy(() => import('./ARPortalScene'))

function LoadingFallback() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#111',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTopColor: '#4ecdc4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Cargando AR...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default function PortalScene() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <Suspense fallback={<LoadingFallback />}>
        <ARPortalScene />
      </Suspense>
    </div>
  )
}
