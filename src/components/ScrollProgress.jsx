import { motion, useScroll, useSpring } from 'framer-motion'
import useMotionPrefs from '../hooks/useMotionPrefs.js'

/**
 * Reading-progress bar across the top of the viewport.
 *
 * Note the z-index in index.css: .grain-overlay sits at 999, so this has
 * to clear it or the grain would wash the bar out.
 */
export default function ScrollProgress() {
  const { motionOk } = useMotionPrefs()
  const { scrollYProgress } = useScroll()

  // The spring is what stops the bar from twitching 1:1 with the wheel.
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 34,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX: motionOk ? scaleX : scrollYProgress }}
      aria-hidden="true"
    />
  )
}
