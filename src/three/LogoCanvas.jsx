import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useLocation } from 'react-router-dom'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import LogoScene from './LogoScene.jsx'

/**
 * One persistent WebGL context for the whole app, fixed behind the page
 * content. Deliberately mounted above <Routes> in App so it survives route
 * changes — remounting a canvas per section or per page is the usual way
 * this pattern turns into a stutter.
 *
 * This module is the lazy-loaded boundary: importing it pulls in three.js,
 * so nothing here runs until useMotionPrefs says the visitor should get 3D.
 *
 * Despite being mounted outside <Routes>, this is still inside <BrowserRouter>
 * (see main.jsx / App.jsx), so useLocation() works normally here without any
 * prop drilling through BrandObject.
 */
export default function LogoCanvas({ motionOk = true, pointerFxOk = true, interactive = true }) {
  const { pathname } = useLocation()
  const onHomeRoute = pathname === '/'

  // Fed by a passive listener rather than read per frame — see
  // useLogoChoreography for why.
  const scrollRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Tracked on `window`, not read from R3F's own `state.pointer`. R3F
  // sources state.pointer from events on the canvas element itself, but
  // .logo-canvas (and everything inside it) is pointer-events:none so
  // clicks pass through to the page underneath — which also means the
  // canvas never receives pointer events, so state.pointer sits frozen at
  // (0,0) forever. window-level listeners aren't gated by another
  // element's pointer-events, so this is the same approach Cursor.jsx
  // already used successfully before it was removed.
  const pointerRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!pointerFxOk) return
    const onPointerMove = (e) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [pointerFxOk])

  // Since LogoCanvas itself never unmounts across route changes (it's
  // outside <Routes>), a ref — not the raw `onHomeRoute` closure — is what
  // keeps the transform below reading the CURRENT route rather than
  // whichever route was active the first time useTransform's callback was
  // captured.
  const onHomeRouteRef = useRef(onHomeRoute)
  onHomeRouteRef.current = onHomeRoute

  // Full presence in the hero, then it recedes to a watermark behind the
  // content once docked, and clears out entirely before the footer. That
  // curve is tuned against the Home page's length — on a route with no
  // hero (e.g. /drops) it's now acting as the literal header logo, so it
  // just stays fully visible instead of following a scroll curve that
  // assumes a much longer page.
  const { scrollYProgress } = useScroll()
  const opacitySource = useTransform(scrollYProgress, (v) => {
    if (!onHomeRouteRef.current) return 1
    if (v < 0.12) return 1 - (v / 0.12) * 0.15
    if (v < 0.86) return 0.85
    if (v < 0.97) return 0.85 - ((v - 0.86) / 0.11) * 0.85
    return 0
  })
  const opacity = useSpring(opacitySource, { stiffness: 120, damping: 30 })

  return (
    <motion.div className="logo-canvas" style={{ opacity }} aria-hidden="true">
      <Canvas
        // Cap DPR — the logo is a soft background object and rendering it
        // at 3x on a high-density display buys nothing visible.
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        // Transparent so the hero's radial gradients show through.
        onCreated={({ gl }) => gl.setClearAlpha(0)}
      >
        <LogoScene
          scrollRef={scrollRef}
          pointerRef={pointerRef}
          motionOk={motionOk}
          pointerFxOk={pointerFxOk}
          onHomeRoute={onHomeRoute}
          interactive={interactive}
        />
      </Canvas>
    </motion.div>
  )
}
