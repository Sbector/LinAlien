interface AROverlaysProps {
  isLoading: boolean
  hasError: boolean
  errorMessage?: string
  isTracking: boolean
  hasStarted: boolean
  onStart: () => void
  markerImage?: string
}

export default function AROverlays({
  isLoading,
  hasError,
  errorMessage,
  isTracking,
  hasStarted,
  onStart,
  markerImage = '/portal_marker.png'
}: AROverlaysProps) {
  if (hasError) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>
          Error de AR
        </h2>
        <p style={{ margin: '0 0 16px', opacity: 0.8, fontSize: '14px' }}>
          {errorMessage || 'No se pudo iniciar la cámara'}
        </p>
        <button
          onClick={onStart}
          style={{
            background: '#4ecdc4',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#000'
          }}
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!hasStarted) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <img
          src={markerImage}
          alt="Portal marker"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '16px',
            border: '3px solid rgba(78, 205, 196, 0.5)',
            objectFit: 'contain',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(78, 205, 196, 0.3)'
          }}
        />
        <h1 style={{
          margin: '0 0 8px',
          fontSize: '24px',
          fontWeight: 600,
          background: 'linear-gradient(90deg, #4ecdc4, #45b7d1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Portal Dimensional
        </h1>
        <p style={{
          margin: '0 0 32px',
          fontSize: '14px',
          opacity: 0.7,
          maxWidth: '280px',
          textAlign: 'center'
        }}>
          Apunta tu cámara al marcador para abrir el portal a otra dimensión
        </p>
        <button
          onClick={onStart}
          style={{
            background: 'linear-gradient(135deg, #4ecdc4, #45b7d1)',
            border: 'none',
            borderRadius: '24px',
            padding: '16px 48px',
            fontSize: '18px',
            fontWeight: 600,
            cursor: 'pointer',
            color: '#000',
            boxShadow: '0 4px 20px rgba(78, 205, 196, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(78, 205, 196, 0.6)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(78, 205, 196, 0.4)'
          }}
        >
          Comenzar
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTopColor: '#4ecdc4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', fontSize: '14px', opacity: 0.8 }}>
          Inicializando cámara...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!isTracking) {
    return (
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        textShadow: '0 2px 8px rgba(0,0,0,0.8)'
      }}>
        <img
          src={markerImage}
          alt="Portal marker"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            border: '2px solid rgba(255,255,255,0.5)',
            objectFit: 'contain',
            background: 'rgba(0,0,0,0.5)'
          }}
        />
        <p style={{
          margin: 0,
          fontSize: '14px',
          background: 'rgba(0,0,0,0.6)',
          padding: '8px 16px',
          borderRadius: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          Apunta al marcador del portal
        </p>
      </div>
    )
  }

  return null
}
