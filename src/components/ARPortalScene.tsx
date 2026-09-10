import { useEffect, useRef, useCallback, useState } from 'react'
import AROverlays from './AROverlays'

declare global {
  interface Window {
    MINDAR: {
      IMAGE: {
        MindARThree: any
      }
    }
    THREE: any
  }
}

export default function ARPortalScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mindarRef = useRef<any>(null)
  const animationRef = useRef<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (mindarRef.current) {
      try { mindarRef.current.stop() } catch {}
      const container = containerRef.current
      if (container) {
        container.innerHTML = ''
      }
      mindarRef.current = null
    }
  }, [])

  const startAR = useCallback(async () => {
    if (!containerRef.current) return
    if (!window.MINDAR?.IMAGE?.MindARThree) {
      setHasError(true)
      setErrorMessage('MindAR no se cargó correctamente')
      return
    }
    if (!window.THREE) {
      setHasError(true)
      setErrorMessage('Three.js no se cargó correctamente')
      return
    }

    setHasStarted(true)
    setHasError(false)
    setIsLoading(true)

    try {
      const mindar = new window.MINDAR.IMAGE.MindARThree({
        container: containerRef.current,
        imageTargetSrc: '/targets.mind',
        maxTrack: 1,
        filterMinCF: 0.0001,
        filterBeta: 1000,
        warmupTolerance: 5,
        missTolerance: 5,
        uiLoading: 'no',
        uiScanning: 'no',
        uiError: 'no',
      })

      mindarRef.current = mindar

      const anchor = mindar.addAnchor(0)

      const THREE = window.THREE
      const group = anchor.group

      const cubeSize = 0.4
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          side: THREE.BackSide,
          roughness: 0.8,
          metalness: 0.1,
        })
      )
      group.add(cube)

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xff6b6b, roughness: 0.3, metalness: 0.5 })
      )
      group.add(sphere)

      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.03, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x4ecdc4, roughness: 0.3, metalness: 0.5 })
      )
      group.add(box)

      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.02, 0.05, 8),
        new THREE.MeshStandardMaterial({ color: 0x45b7d1, roughness: 0.3, metalness: 0.5 })
      )
      group.add(cone)

      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(0.02, 0.007, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0xf9ca24, roughness: 0.3, metalness: 0.5 })
      )
      group.add(torus)

      mindar.scene.add(new THREE.AmbientLight(0xffffff, 0.6))

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
      dirLight.position.set(0.5, 0.5, 0.5)
      mindar.scene.add(dirLight)

      const pl1 = new THREE.PointLight(0xff6b6b, 0.5)
      pl1.position.set(-0.3, 0.2, -0.2)
      mindar.scene.add(pl1)

      const pl2 = new THREE.PointLight(0x4ecdc4, 0.5)
      pl2.position.set(0.3, -0.2, 0.2)
      mindar.scene.add(pl2)

      anchor.onTargetFound = () => {
        console.log('[AR] Target found')
        setIsTracking(true)
        setIsLoading(false)
      }

      anchor.onTargetLost = () => {
        console.log('[AR] Target lost')
        setIsTracking(false)
      }

      await mindar.start()

      setIsLoading(false)

      let time = 0
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate)
        time += 0.016

        sphere.position.y = Math.sin(time * 0.8) * 0.05
        sphere.rotation.x = time * 0.5
        sphere.rotation.z = time * 0.3

        box.position.x = Math.sin(time * 0.6) * 0.08
        box.position.y = Math.cos(time * 0.4) * 0.03
        box.rotation.y = time * 0.7

        cone.position.x = Math.cos(time * 0.5) * 0.06
        cone.position.z = Math.sin(time * 0.7) * 0.05
        cone.rotation.z = time

        torus.position.y = Math.sin(time * 0.3) * 0.06
        torus.position.x = Math.sin(time * 0.4) * 0.05
        torus.rotation.x = time * 0.6
        torus.rotation.y = time * 0.4

        mindar.renderer.render(mindar.scene, mindar.camera)
      }
      animate()

    } catch (err: any) {
      console.error('[AR] Error:', err)
      setHasError(true)
      setErrorMessage(err?.message || 'Error al iniciar AR')
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />
      <AROverlays
        isLoading={isLoading}
        hasError={hasError}
        errorMessage={errorMessage}
        isTracking={isTracking}
        hasStarted={hasStarted}
        onStart={startAR}
      />
    </div>
  )
}
