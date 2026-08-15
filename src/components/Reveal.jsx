import { motion } from 'framer-motion'
import useMotionPrefs from '../hooks/useMotionPrefs.js'

// The project's signature curve, shared with the page transitions so all
// motion on the site has one personality.
const EASE = [0.22, 1, 0.36, 1]

const OFFSETS = {
  up: { x: 0, y: 28 },
  left: { x: -32, y: 0 },
  right: { x: 32, y: 0 },
}

/**
 * Wrap a section to fade + slide it in the first time it scrolls into view.
 *
 * `once: true` matches the original behaviour (the old vanilla-JS version
 * called io.unobserve after revealing).
 *
 * @param direction 'up' | 'left' | 'right'
 * @param blur      also animate a blur out — richer than opacity alone, but
 *                  keep it off large surfaces, it's the expensive one
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
  direction = 'up',
  blur = false,
}) {
  const { motionOk } = useMotionPrefs()
  const offset = OFFSETS[direction] ?? OFFSETS.up

  if (!motionOk) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x: offset.x,
        y: offset.y,
        ...(blur ? { filter: 'blur(6px)' } : null),
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        ...(blur ? { filter: 'blur(0px)' } : null),
      }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}
