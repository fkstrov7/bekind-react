import { useEffect, useState } from 'react'

/**
 * Scroll-spy. Returns the id of whichever section is currently nearest the
 * top of the viewport, so the nav can highlight exactly one link at a time.
 *
 * This replaces NavLink's isActive for the hash links: isActive matches on
 * pathname only, so on "/" every hash link was matching at once and all
 * three rendered pink together.
 *
 * We track intersection *ratios* rather than firing on entry, because
 * several of these sections are tall enough to be on screen simultaneously
 * and "most visible near the top" is the honest answer to "where am I".
 */
export default function useActiveSection(ids, { rootMargin = '-45% 0px -50% 0px' } = {}) {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    if (!ids || ids.length === 0) return
    if (typeof IntersectionObserver === 'undefined') return

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (elements.length === 0) return

    // The band described by rootMargin is a thin strip across the middle of
    // the viewport; whichever section overlaps it is the one you're "in".
    const visible = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio)
          else visible.delete(entry.target.id)
        }

        if (visible.size === 0) {
          setActiveId(null)
          return
        }

        // Preserve document order on ties so the highlight doesn't flicker
        // between two equally-visible neighbours.
        let best = null
        let bestRatio = -1
        for (const id of ids) {
          if (!visible.has(id)) continue
          const ratio = visible.get(id)
          if (ratio > bestRatio) {
            best = id
            bestRatio = ratio
          }
        }
        setActiveId(best)
      },
      { rootMargin, threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids.join('|'), rootMargin])

  return activeId
}
