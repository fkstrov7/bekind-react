import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'

/**
 * The scroll choreography for the 3D logo, in one place so it stays tunable.
 *
 *   Phase A — arrival:   large, centred-ish, the hero's sole visual.
 *   Phase B — the dock:  across the hero's scroll range it shrinks and
 *                        travels up into the header, landing over the
 *                        empty logo-mark hit-target (see Header.jsx).
 *   Phase C — companion: docked in the header for the remainder of the
 *                        page, still facing the cursor.
 *
 * Everything is damped toward a target rather than assigned directly, so
 * the object eases instead of snapping to the scrollbar. Nothing here
 * touches React state — that would re-render the tree every frame.
 */

// Arrival pose. Chosen from real DOM measurements, not a single test
// screenshot: the eyebrow's top edge sits at 269/319/409px for 800/900/
// 1080px-tall viewports respectively (the worst case, 800px, is a common
// laptop window height). y=1.53 + scale=1.15 keeps the object's bottom
// edge comfortably above the eyebrow at ALL three (31-88px clearance)
// with no top-edge clipping either — the previous y=1.4/scale=1.3 only
// had ~8px of margin at one specific height and genuinely overlapped the
// eyebrow text at shorter real-world windows.
const CENTER = { x: 0.15, y: 1.53, z: 0, scale: 1.15 }

// The dock target is computed live from the viewport (see below) so it
// tracks the header's actual on-screen logo position across window sizes,
// rather than a fixed world-unit offset that only looked right at one
// aspect ratio. These are screen fractions, top-left origin: the header
// has `padding: 20px 28px` and the old logo image was 100px tall, so this
// aims for roughly that corner. DOCK_SCALE/DOCK_Z are the small "header
// icon" size or the object shrinks to.
const DOCK_FRAC_X = 0.115
const DOCK_FRAC_Y = 0.078
const DOCK_SCALE = 0.34
const DOCK_Z = 0.4 // closer to camera than CENTER.z=0, so it reads crisp at small scale

// How hard it leans toward the pointer, and the small position nudge
// (reaching toward the cursor, not just tilting).
const PAN_X = 0.22
const PAN_Y = 0.14
// The "look-at" facing angle is clamped so it never turns to an absurd
// extreme even when the cursor is far from the object.
const FACE_MAX_Y = 0.55
const FACE_MAX_X = 0.35
// Larger = gentler/more subtle facing response, smaller = snappier/more
// dramatic turning toward the cursor.
const FACE_DEPTH = 3.5

export const CHOREOGRAPHY = { CENTER, DOCK_FRAC_X, DOCK_FRAC_Y, DOCK_SCALE, DOCK_Z }

/**
 * @param groupRef     the three.js group to drive
 * @param scrollRef    a ref holding the current scrollY, fed by a passive
 *                     scroll listener — reading window.scrollY inside
 *                     useFrame would be a layout read on every frame
 * @param pointerRef   a ref holding normalized {x,y} cursor coordinates,
 *                     fed by a window-level pointermove listener — NOT
 *                     R3F's own state.pointer, which sources from events
 *                     on the canvas element and is permanently (0,0) here
 *                     since the canvas is pointer-events:none (see
 *                     LogoCanvas.jsx for why)
 * @param onHomeRoute  false on any route without a hero to scroll through
 *                     (e.g. /drops) — the object should already be docked
 *                     rather than playing the big arrival pose there
 */
export default function useLogoChoreography(
  groupRef,
  scrollRef,
  pointerRef,
  { motionOk = true, pointerFxOk = true, onHomeRoute = true } = {}
) {
  // Cached so we're not reading layout properties every frame.
  const viewportH = useRef(typeof window !== 'undefined' ? window.innerHeight : 1)
  const introRef = useRef(0)

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    // delta can spike badly after a tab has been backgrounded; clamping
    // keeps the damping from overshooting on the first frame back.
    const dt = Math.min(delta, 0.1)
    viewportH.current = state.size.height || viewportH.current

    // state.viewport gives world-space width/height matching the visible
    // frustum at z=0 for the current camera/aspect — this is what lets the
    // dock target track the header across window sizes instead of sitting
    // at a fixed world-unit offset that only lined up at one aspect ratio.
    const vw = state.viewport.width
    const vh = state.viewport.height
    const dockedX = -vw / 2 + DOCK_FRAC_X * vw
    const dockedY = vh / 2 - DOCK_FRAC_Y * vh

    if (!motionOk) {
      // Reduced motion: hold a resting pose, no float, no dock, no tilt.
      // Still route-aware — a non-home route shouldn't show the big
      // arrival pose even with motion off.
      if (onHomeRoute) {
        group.position.set(CENTER.x, CENTER.y, CENTER.z)
        group.scale.setScalar(CENTER.scale)
      } else {
        group.position.set(dockedX, dockedY, DOCK_Z)
        group.scale.setScalar(DOCK_SCALE)
      }
      group.rotation.set(0, 0, 0)
      return
    }

    // --- scroll progress ---------------------------------------------------
    // p goes 0 -> 1 across the first viewport of scrolling (the hero).
    // Non-home routes have no hero to scroll through, so they're always
    // fully docked regardless of scroll position — otherwise the object
    // would render at the large CENTER pose on top of e.g. the drops grid.
    const scrollTop = scrollRef?.current ?? 0
    const p = onHomeRoute
      ? MathUtils.clamp(scrollTop / Math.max(viewportH.current, 1), 0, 1)
      : 1
    // Ease it so the dock has some weight at both ends.
    const eased = p * p * (3 - 2 * p)

    // --- intro ---------------------------------------------------------------
    // Runs once on mount: scales up and unwinds a quarter turn.
    introRef.current = Math.min(introRef.current + dt / 1.2, 1)
    const intro = 1 - Math.pow(1 - introRef.current, 3)

    // --- pointer reach ---------------------------------------------------------
    const t = state.clock.elapsedTime
    const pointerX = pointerFxOk ? (pointerRef?.current.x ?? 0) : 0
    const pointerY = pointerFxOk ? (pointerRef?.current.y ?? 0) : 0
    // The cursor's position in the SAME world-space plane the object lives
    // in (not just normalized -1..1 relative to viewport centre) — this is
    // what makes the facing calculation below correct wherever the object
    // currently sits, hero-centre or docked corner, rather than only
    // looking right near the centre the way a flat pointer-coordinate
    // multiplier did.
    const pointerWorldX = pointerX * vw * 0.5
    const pointerWorldY = pointerY * vh * 0.5

    // --- targets ----------------------------------------------------------
    const targetX = MathUtils.lerp(CENTER.x, dockedX, eased) + pointerX * PAN_X
    const targetY =
      MathUtils.lerp(CENTER.y, dockedY, eased) +
      pointerY * PAN_Y +
      Math.sin(t * 0.6) * 0.05 // ambient float
    const targetZ = MathUtils.lerp(CENTER.z, DOCK_Z, eased)
    const targetScale = MathUtils.lerp(CENTER.scale, DOCK_SCALE, eased) * intro

    // Facing the cursor: the vector from the object's CURRENT (already
    // damped) position to the cursor's world position, turned into a
    // look-at-ish yaw/pitch via atan2 against a fixed "depth" reference,
    // then clamped so it never turns to an extreme. Computed from the
    // object's actual position rather than a flat pointer multiplier, so
    // it looks intentional and correct at every point along the
    // arrival -> dock journey, not just near the viewport centre.
    const dx = pointerWorldX - group.position.x
    const dy = pointerWorldY - group.position.y
    const faceY = MathUtils.clamp(Math.atan2(dx, FACE_DEPTH), -FACE_MAX_Y, FACE_MAX_Y)
    const faceX = MathUtils.clamp(-Math.atan2(dy, FACE_DEPTH), -FACE_MAX_X, FACE_MAX_X)

    const targetRotY =
      (1 - intro) * -Math.PI * 0.5 + // unwind on arrival
      eased * 0.15 + // a light turn as it settles into the header, not a hard twist
      faceY +
      Math.sin(t * 0.4) * 0.03
    const targetRotX = faceX + Math.sin(t * 0.5) * 0.02
    const targetRotZ = MathUtils.lerp(0, -0.04, eased)

    // --- damp toward them --------------------------------------------------
    group.position.x = MathUtils.damp(group.position.x, targetX, 4, dt)
    group.position.y = MathUtils.damp(group.position.y, targetY, 4, dt)
    group.position.z = MathUtils.damp(group.position.z, targetZ, 4, dt)

    group.rotation.x = MathUtils.damp(group.rotation.x, targetRotX, 3.5, dt)
    group.rotation.y = MathUtils.damp(group.rotation.y, targetRotY, 3.5, dt)
    group.rotation.z = MathUtils.damp(group.rotation.z, targetRotZ, 3.5, dt)

    const s = MathUtils.damp(group.scale.x, targetScale, 4, dt)
    group.scale.setScalar(s)
  })
}
