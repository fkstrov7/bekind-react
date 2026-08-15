import { Fragment, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import useMotionPrefs from '../hooks/useMotionPrefs.js'

const EASE = [0.22, 1, 0.36, 1]

/**
 * Staggers a heading in a fragment at a time.
 *
 * The viewport check deliberately lives on the WRAPPER, not on the
 * individual pieces. Each piece starts translated 105% down, outside its
 * word's overflow:hidden clip box — and IntersectionObserver clips against
 * ancestor overflow, so a per-piece whileInView reports 0% visible and
 * never fires. The piece can't animate until it's visible and can't become
 * visible until it animates. Observing the un-clipped wrapper avoids that
 * deadlock entirely.
 *
 * Accessibility: pieces are aria-hidden and the whole string is exposed
 * once via aria-label, so a screen reader reads "Manifiesto" rather than
 * "M a n i f i e s t o". Under reduced motion it renders the plain string.
 */
export default function SplitText({
  text,
  as: Component = 'span',
  by = 'char', // 'char' for short display headings, 'word' for longer copy
  className = '',
  delay = 0,
  stagger = 0.03,
}) {
  const { motionOk } = useMotionPrefs()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  if (!motionOk) {
    return <Component className={className}>{text}</Component>
  }

  // Split on words either way — char mode still needs word boundaries so
  // lines wrap normally instead of breaking mid-word.
  const words = text.split(' ')
  let index = 0

  return (
    <Component ref={ref} className={`split-root ${className}`.trim()} aria-label={text}>
      {words.map((word, wi) => {
        const pieces = by === 'char' ? Array.from(word) : [word]
        return (
          <Fragment key={wi}>
          <span className="split-word" aria-hidden="true">
            {pieces.map((piece, pi) => {
              const i = index++
              return (
                <motion.span
                  className="split-piece"
                  key={pi}
                  initial={{ y: '105%', opacity: 0 }}
                  animate={inView ? { y: '0%', opacity: 1 } : { y: '105%', opacity: 0 }}
                  transition={{ duration: 0.65, ease: EASE, delay: delay + i * stagger }}
                >
                  {piece}
                </motion.span>
              )
            })}
          </span>
          {/* Space sits OUTSIDE the clip box — inside it, overflow:hidden
              swallows the trailing space and the words run together. */}
          {wi < words.length - 1 ? ' ' : null}
          </Fragment>
        )
      })}
    </Component>
  )
}
