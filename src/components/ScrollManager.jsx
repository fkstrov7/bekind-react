import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getLenis, scrollToTarget } from '../hooks/useSmoothScroll.js'

// Clearance for the fixed header when jumping to a section.
const HEADER_OFFSET = -110
// Longest we'll wait for a hash target that isn't in the DOM yet. Needs to
// cover the outgoing page's exit animation — AnimatePresence mode="wait"
// (App.jsx) means the incoming page, and any element on it, doesn't mount
// until that finishes (~0.45s, see PageTransition.jsx). Cross-page hash
// links (e.g. DropsTeaser's CTA linking /drops -> /#connect) were quietly
// falling back to scroll-to-top and never retrying, since the very first,
// synchronous DOM check ran before the target existed.
const HASH_WAIT_MS = 1200

/**
 * The three scroll behaviours React Router v6 doesn't provide:
 *
 *  1. Scroll to top on route change — without this, going Home -> /drops
 *     mid-scroll lands you at the same pixel offset on the new page.
 *  2. Scroll to a #hash target — router navigation changes the URL but
 *     never moves the viewport, which is why the nav's hash links did
 *     nothing before.
 *  3. Keep keyboard focus visible — Lenis intercepts wheel/key scrolling,
 *     which can leave a tabbed-to element off screen.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      scrollToTarget(0, { immediate: true })
      return
    }

    const id = hash.slice(1)
    let rafId
    let cancelled = false
    const deadline = performance.now() + HASH_WAIT_MS
    // The element existing isn't enough on its own: right as the incoming
    // page mounts, its layout can still be mid-transition (measured once,
    // document height jumped from ~926px to ~4949px within a couple of
    // frames of mount) — scrolling against that premature layout computes
    // a target far short of where the element ends up. Wait for
    // scrollHeight to hold steady across two consecutive frames too.
    let lastHeight = -1
    let stableFrames = 0

    function tryScroll() {
      if (cancelled) return
      const el = document.getElementById(id)
      const height = document.documentElement.scrollHeight
      stableFrames = height === lastHeight ? stableFrames + 1 : 0
      lastHeight = height

      if (el && stableFrames >= 2) {
        scrollToTarget(el, { offset: HEADER_OFFSET })
        return
      }
      // Not ready yet — either the element hasn't mounted, or layout is
      // still settling. Keep checking each frame until both hold, or give
      // up and fall back to the top.
      if (performance.now() < deadline) {
        rafId = requestAnimationFrame(tryScroll)
      } else {
        scrollToTarget(0, { immediate: true })
      }
    }

    rafId = requestAnimationFrame(tryScroll)
    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
    }
  }, [pathname, hash])

  // Lenis owns the scroll position, so the browser's native "scroll the
  // focused element into view" doesn't take effect. Re-implement it.
  useEffect(() => {
    function onFocusIn(e) {
      const lenis = getLenis()
      if (!lenis) return // native focus scrolling still works

      const el = e.target
      if (!el || !el.getBoundingClientRect) return

      const rect = el.getBoundingClientRect()
      const fullyVisible =
        rect.top >= Math.abs(HEADER_OFFSET) && rect.bottom <= window.innerHeight

      if (!fullyVisible) scrollToTarget(el, { offset: HEADER_OFFSET })
    }

    document.addEventListener('focusin', onFocusIn)
    return () => document.removeEventListener('focusin', onFocusIn)
  }, [])

  return null
}
