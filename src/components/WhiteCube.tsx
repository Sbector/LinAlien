interface WhiteCubeProps {
  size?: number
}

export default function WhiteCube({ size = 3 }: WhiteCubeProps) {
  return (
    <mesh>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial
        color="#ffffff"
        side={2}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )
}
