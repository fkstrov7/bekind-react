import { motion } from 'framer-motion'
import useMotionPrefs from '../hooks/useMotionPrefs.js'

const EASE = [0.22, 1, 0.36, 1]

/**
 * Route transition: an ink panel sweeps across on exit and off on enter,
 * with the mark briefly centred. The 3D canvas sits behind this and is
 * never remounted, so the logo holds its position through the wipe.
 */
const panelVariants = {
  initial: { scaleX: 1, originX: 0 },
  animate: { scaleX: 0, originX: 1, transition: { duration: 0.5, ease: EASE } },
  exit: { scaleX: 1, originX: 0, transition: { duration: 0.45, ease: EASE } },
}

const contentVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay: 0.18 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3, ease: EASE } },
}

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
}

export default function PageTransition({ children }) {
  const { motionOk } = useMotionPrefs()

  if (!motionOk) {
    return (
      <motion.div variants={reducedVariants} initial="initial" animate="animate" exit="exit">
        {children}
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        className="page-wipe"
        variants={panelVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        aria-hidden="true"
      />
      <motion.div variants={contentVariants} initial="initial" animate="animate" exit="exit">
        {children}
      </motion.div>
    </>
  )
}
