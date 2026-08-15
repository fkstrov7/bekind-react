import { useEffect } from 'react'
import Lenis from 'lenis'
import useMotionPrefs from './useMotionPrefs.js'

/**
 * Inertial smooth scrolling. This is the substrate the scroll-linked
 * effects sit on — without it, scroll-driven motion tracks the scrollbar
 * 1:1 and reads as jittery rather than weighted.
 *
 * IMPORTANT: `html { scroll-behavior: smooth }` must stay OUT of index.css.
 * Native smooth-scroll and Lenis fight each other and produce stutter.
 */

// Module-level so non-React callers (ScrollManager) can reach the live
// instance without prop-drilling or a context provider.
let lenisInstance = null

export function getLenis() {
  return lenisInstance
}

/**
 * Scroll to a target, using Lenis when it's running and falling back to
 * the native API when it isn't (reduced motion, or before mount).
 */
export function scrollToTarget(target, { offset = 0, immediate = false } = {}) {
  const lenis = getLenis()
  if (lenis) {
    // Lenis caches its scrollable limit (contentHeight - viewportHeight)
    // and re-measures it via a ResizeObserver — which is debounced/batched
    // and can still be holding a STALE (too-small) limit from the
    // previous route's content height at the exact moment a route change
    // calls scrollTo. Real bug hit in practice: navigating from the short
    // /drops page to /#connect on the much taller Home page computed a
    // scroll target clamped to ~26px (exactly the old page's height minus
    // the viewport) instead of the real ~4145px target. An explicit,
    // synchronous resize() first guarantees the limit reflects the
    // CURRENT DOM before scrollTo does its math.
    lenis.resize()
    lenis.scrollTo(target, { offset, immediate })
    return
  }
  // Native fallback. `target` is an element or a number of pixels.
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' })
  } else if (target && target.getBoundingClientRect) {
    const top = window.scrollY + target.getBoundingClientRect().top + offset
    window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' })
  }
}

export default function useSmoothScroll() {
  const { motionOk } = useMotionPrefs()

  useEffect(() => {
    // Reduced motion gets plain native scrolling — no interception at all.
    if (!motionOk) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices already have good native inertia; overriding it
      // tends to feel worse than leaving it alone.
      syncTouch: false,
    })

    lenisInstance = lenis

    let frame
    function raf(time) {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenisInstance = null
    }
  }, [motionOk])
}
