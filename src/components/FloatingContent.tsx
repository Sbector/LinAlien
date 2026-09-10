import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

interface FloatingContentProps {
  scale?: number
}

export default function FloatingContent({ scale = 1 }: FloatingContentProps) {
  const sphereRef = useRef<Mesh>(null)
  const boxRef = useRef<Mesh>(null)
  const coneRef = useRef<Mesh>(null)
  const torusRef = useRef<Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (sphereRef.current) {
      sphereRef.current.position.y = Math.sin(t * 0.8) * 0.3
      sphereRef.current.rotation.x = t * 0.5
      sphereRef.current.rotation.z = t * 0.3
    }
    if (boxRef.current) {
      boxRef.current.position.x = Math.sin(t * 0.6) * 0.5
      boxRef.current.position.y = Math.cos(t * 0.4) * 0.2
      boxRef.current.rotation.y = t * 0.7
    }
    if (coneRef.current) {
      coneRef.current.position.x = Math.cos(t * 0.5) * 0.4
      coneRef.current.position.z = Math.sin(t * 0.7) * 0.3
      coneRef.current.rotation.z = t
    }
    if (torusRef.current) {
      torusRef.current.position.y = Math.sin(t * 0.3) * 0.4
      torusRef.current.position.x = Math.sin(t * 0.4) * 0.3
      torusRef.current.rotation.x = t * 0.6
      torusRef.current.rotation.y = t * 0.4
    }
  })

  return (
    <group scale={[scale, scale, scale]}>
      <mesh ref={sphereRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#ff6b6b" roughness={0.3} metalness={0.5} />
      </mesh>

      <mesh ref={boxRef} position={[0.8, 0.2, -0.3]}>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshStandardMaterial color="#4ecdc4" roughness={0.3} metalness={0.5} />
      </mesh>

      <mesh ref={coneRef} position={[-0.7, -0.3, 0.2]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#45b7d1" roughness={0.3} metalness={0.5} />
      </mesh>

      <mesh ref={torusRef} position={[0.3, -0.5, -0.5]}>
        <torusGeometry args={[0.15, 0.05, 16, 32]} />
        <meshStandardMaterial color="#f9ca24" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  )
}
