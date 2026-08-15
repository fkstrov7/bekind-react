import { Suspense, lazy } from 'react'
import useMotionPrefs from '../hooks/useMotionPrefs.js'

/**
 * The lazy boundary for three.js.
 *
 * three + fiber + drei is roughly 600 KB gzipped against a ~150 KB app, so
 * the import only happens once we've decided this visitor actually gets 3D.
 * Phones, reduced-motion visitors, and touch devices never download it —
 * they get <LogoFallback /> in the hero instead.
 */
const LogoCanvas = lazy(() => import('../three/LogoCanvas.jsx'))

export default function BrandObject() {
  const { canRender3D, motionOk, pointerFxOk } = useMotionPrefs()

  if (!canRender3D) return null

  return (
    <Suspense fallback={null}>
      <LogoCanvas motionOk={motionOk} pointerFxOk={pointerFxOk} />
    </Suspense>
  )
}
