import { useMemo } from 'react'
import { Shape, ExtrudeGeometry } from 'three'

/**
 * Stand-in for bekind3d.glb so the choreography can be built and reviewed
 * before the real model is exported from Blender.
 *
 * It deliberately mirrors the real logo's structure — an outer frame
 * ("Marco"), a wordmark plate ("Letras") and a sparkle ("Destello") — so
 * the proportions and motion read correctly. Delete this once the GLB
 * lands; LogoModel picks the real one automatically when it loads.
 */

function useRoundedRect(w, h, r) {
  return useMemo(() => {
    const shape = new Shape()
    const x = -w / 2
    const y = -h / 2
    shape.moveTo(x + r, y)
    shape.lineTo(x + w - r, y)
    shape.quadraticCurveTo(x + w, y, x + w, y + r)
    shape.lineTo(x + w, y + h - r)
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    shape.lineTo(x + r, y + h)
    shape.quadraticCurveTo(x, y + h, x, y + h - r)
    shape.lineTo(x, y + r)
    shape.quadraticCurveTo(x, y, x + r, y)
    return shape
  }, [w, h, r])
}

function ExtrudedRect({ w, h, r, depth, color, ...props }) {
  const shape = useRoundedRect(w, h, r)
  const geometry = useMemo(
    () =>
      new ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelSize: 0.012,
        bevelThickness: 0.012,
        bevelSegments: 2,
        curveSegments: 12,
      }),
    [shape, depth]
  )
  return (
    <mesh geometry={geometry} castShadow receiveShadow {...props}>
      <meshStandardMaterial color={color} roughness={0.42} metalness={0.08} />
    </mesh>
  )
}

export default function PlaceholderLogo() {
  return (
    <group>
      {/* Marco — outer frame */}
      <ExtrudedRect w={2.4} h={0.92} r={0.16} depth={0.09} color="#ece6d8" position={[0, 0, -0.05]} />
      {/* Letras — inner plate standing proud of the frame */}
      <ExtrudedRect w={2.0} h={0.56} r={0.08} depth={0.11} color="#141310" position={[0, 0, 0.02]} />
      {/* Destello — the sparkle */}
      <mesh position={[1.18, 0.46, 0.12]} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.17, 0]} />
        <meshStandardMaterial color="#ff2d3d" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  )
}
