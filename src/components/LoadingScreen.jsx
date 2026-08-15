import { useEffect, useState } from 'react'

// Never flashes-and-vanishes on a fast connection, never leaves a visitor
// stuck if fonts/fetches stall — a simple heuristic rather than a fragile
// "is the 3D model exactly ready" signal threaded across BrandObject ->
// LogoCanvas -> LogoModel.
const MIN_DISPLAY_MS = 900
const MAX_WAIT_MS = 4500
// Matches the CSS transition below — time to let the fade-out finish
// before actually unmounting.
const FADE_MS = 500

/**
 * Shown from first paint until the page is basically ready to look at.
 * Without this, a first-time visitor sees a dark, empty hero for however
 * long fonts take to load and — for desktop/3D visitors — the lazy
 * LogoCanvas chunk (~900KB) plus the GLB model to fetch and parse. That
 * gap is more noticeable now than it would once have been: the 3D object
 * is the hero's only visual since the flat wordmark was removed.
 */
export default function LoadingScreen() {
  const [ready, setReady] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let cancelled = false

    const minDelay = new Promise((resolve) => setTimeout(resolve, MIN_DISPLAY_MS))
    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    const safetyTimeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS))

    Promise.race([Promise.all([minDelay, fontsReady]), safetyTimeout]).then(() => {
      if (!cancelled) setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setHidden(true), FADE_MS)
    return () => clearTimeout(t)
  }, [ready])

  if (hidden) return null

  return (
    <div className={`loading-screen${ready ? ' is-ready' : ''}`} aria-hidden="true">
      <img className="loading-logo" src="/Logosvg.svg" alt="" />
      <div className="loading-bar">
        <span />
      </div>
    </div>
  )
}
