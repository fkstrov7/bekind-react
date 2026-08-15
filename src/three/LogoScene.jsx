import { Suspense, useRef } from 'react'
import LogoModel from './LogoModel.jsx'
import PlaceholderLogo from './PlaceholderLogo.jsx'
import ModelBoundary from './ModelBoundary.jsx'
import useLogoChoreography from './useLogoChoreography.js'

/**
 * Everything that lives inside the <Canvas>. The group this drives is the
 * web equivalent of the `Empty` the logo curves are parented to in Blender.
 *
 * LogoModel is always attempted, wrapped in Suspense + an error boundary:
 * ModelBoundary catches a missing file, a bad export, or a decode failure
 * and swaps in PlaceholderLogo. An earlier version pre-checked for the
 * file with a HEAD request before attempting to load it — that probe used
 * a bare fetch() with no AbortController, and React 18 StrictMode's
 * double-invoked effects raced it against itself in dev, intermittently
 * aborting the request and leaving the logo blank even though the file
 * loaded fine moments later via a second, unrelated request. Suspense +
 * an error boundary is the correct tool for "may or may not be there"
 * and doesn't have that failure mode.
 */
export default function LogoScene({ scrollRef, pointerRef, motionOk, pointerFxOk, onHomeRoute }) {
  const groupRef = useRef()

  useLogoChoreography(groupRef, scrollRef, pointerRef, { motionOk, pointerFxOk, onHomeRoute })

  return (
    <>
      {/* Key light, warm paper-white, standing in for the Blender Area lamp */}
      <directionalLight position={[3, 4, 5]} intensity={2.1} color="#ece6d8" />
      {/* Brand rim light — ties the object to the red/white/black palette
          without recolouring the materials themselves. The site previously
          paired this with a blue rim on the opposite side; dropped outright
          rather than recoloured to "black" — a black light source doesn't
          illuminate anything, so removal is the correct 3D-lighting
          equivalent of "drop the blue". Key + ambient carry fill duty alone. */}
      <directionalLight position={[-5, 1, -2]} intensity={2.4} color="#ff2d3d" />
      <ambientLight intensity={0.6} color="#8d867c" />

      <group ref={groupRef}>
        <ModelBoundary fallback={<PlaceholderLogo />}>
          <Suspense fallback={null}>
            <LogoModel />
          </Suspense>
        </ModelBoundary>
      </group>
    </>
  )
}
