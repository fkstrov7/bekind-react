import { useMemo, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import useMotionPrefs from '../hooks/useMotionPrefs.js'

// Keep the pull small. Past ~10px it stops feeling like weight and starts
// feeling like the button is dodging the cursor.
const MAX_PULL = 9

/**
 * Springs its child toward the cursor while the pointer is inside it.
 *
 * `as` lets this wrap whatever the call site needs — a react-router <Link>,
 * an <a>, or a <button> — without the wrapper adding an extra element that
 * would break the existing .cta-row flex layout.
 */
export default function MagneticButton({ as: Component = 'a', children, className, ...props }) {
  const { pointerFxOk } = useMotionPrefs()
  const ref = useRef(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 })

  // Must be memoised — motion(X) returns a NEW component type each call,
  // so building it inline would remount the child on every render.
  const MotionComponent = useMemo(() => motion(Component), [Component])

  function onPointerMove(e) {
    if (!pointerFxOk || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    // Offset from the element's centre, normalised to -1..1.
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    x.set(Math.max(-1, Math.min(1, dx)) * MAX_PULL)
    y.set(Math.max(-1, Math.min(1, dy)) * MAX_PULL)
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  if (!pointerFxOk) {
    return (
      <Component className={className} {...props}>
        {children}
      </Component>
    )
  }

  return (
    <MotionComponent
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      // Without this the button can stay displaced after a click-drag.
      onBlur={reset}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}
