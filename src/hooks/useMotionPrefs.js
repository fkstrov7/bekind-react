import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * One place to ask "how much motion is this visitor allowed to see?".
 *
 * Every effect added in the dynamic pass reads from here instead of
 * re-checking prefers-reduced-motion / pointer type on its own, so the
 * rules stay consistent and there's a single thing to change later.
 *
 *   motionOk   — false if the OS says "reduce motion". Gate ALL animation.
 *   finePointer — true for mouse/trackpad. Gate hover + cursor-tracking.
 *   wide       — true above the 860px breakpoint used in index.css.
 *   canRender3D — the combination that has to hold before we pay for WebGL.
 */

function useMediaQuery(query, initial = false) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return initial
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    // addEventListener isn't available on MediaQueryList in older Safari.
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    setMatches(mq.matches)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [query])

  return matches
}

export default function useMotionPrefs() {
  const prefersReducedMotion = useReducedMotion()
  // Both queries, not just one: a stylus or hybrid device can report a
  // fine pointer while having no true hover state, and hover effects on
  // those become sticky states you can't get out of.
  const precise = useMediaQuery('(pointer: fine)', true)
  const canHover = useMediaQuery('(hover: hover)', true)
  const finePointer = precise && canHover
  const wide = useMediaQuery('(min-width: 861px)', true)

  const motionOk = !prefersReducedMotion

  return {
    motionOk,
    prefersReducedMotion: !!prefersReducedMotion,
    finePointer,
    wide,
    // Phones and reduced-motion visitors never load the three.js chunk.
    canRender3D: motionOk && finePointer && wide,
    // Pointer-tracked effects (magnetic buttons, tilt, custom cursor).
    pointerFxOk: motionOk && finePointer,
  }
}
