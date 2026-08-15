import { useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue, useScroll, useVelocity, useTransform } from 'framer-motion'
import useMotionPrefs from '../hooks/useMotionPrefs.js'

/**
 * Infinite ticker. Two identical copies of the content sit side by side and
 * the pair is translated left; once it has moved one copy's width the
 * offset wraps, so the seam is never visible.
 *
 * Scroll velocity nudges the speed and can reverse the direction, which is
 * what makes it feel connected to the page rather than decorative.
 */
export default function Marquee({
  text = 'BE KIND',
  separator = '·',
  baseSpeed = 40, // px per second
  className = '',
}) {
  const { motionOk } = useMotionPrefs()
  const x = useMotionValue(0)
  const trackRef = useRef(null)

  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  // Map raw scroll velocity to a modest multiplier so a fast flick speeds
  // the ticker up noticeably without it becoming a blur.
  const velocityFactor = useTransform(scrollVelocity, [-2000, 0, 2000], [-3, 1, 3], {
    clamp: false,
  })

  useAnimationFrame((_, delta) => {
    if (!motionOk || !trackRef.current) return

    // One copy's width. Content is duplicated, so this is half the track.
    const copyWidth = trackRef.current.scrollWidth / 2
    if (!copyWidth) return

    const factor = velocityFactor.get()
    let next = x.get() - (baseSpeed * (delta / 1000) * factor)

    // Wrap in both directions so a reversal doesn't leave a gap.
    if (next <= -copyWidth) next += copyWidth
    if (next > 0) next -= copyWidth

    x.set(next)
  })

  const items = Array.from({ length: 6 }, (_, i) => (
    <span className="marquee-item" key={i}>
      {text}
      <span className="marquee-sep">{separator}</span>
    </span>
  ))

  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <motion.div className="marquee-track" ref={trackRef} style={{ x: motionOk ? x : 0 }}>
        {items}
        {/* Duplicate copy — this is what makes the loop seamless. */}
        {items}
      </motion.div>
    </div>
  )
}
