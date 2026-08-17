import { Suspense, lazy } from 'react'
import useMotionPrefs from '../hooks/useMotionPrefs.js'

/**
 * The lazy boundary for three.js.
 *
 * three + fiber + drei is roughly 600 KB gzipped against a ~150 KB app, so
 * the import only happens once we've decided this visitor actually gets 3D.
 * Reduced-motion visitors never download it — they get <LogoFallback /> in
 * the hero instead. Everyone else gets the model: mouse/trackpad visitors
 * get the cursor-facing version, touch visitors get a simpler auto-rotating
 * version (see interactive3D / useLogoChoreography).
 */
const LogoCanvas = lazy(() => import('../three/LogoCanvas.jsx'))

export default function BrandObject() {
  const { canRender3D, motionOk, pointerFxOk, interactive3D } = useMotionPrefs()

  if (!canRender3D) return null

  return (
    <Suspense fallback={null}>
      <LogoCanvas motionOk={motionOk} pointerFxOk={pointerFxOk} interactive={interactive3D} />
    </Suspense>
  )
}
