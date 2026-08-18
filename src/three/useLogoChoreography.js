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
 *                        page — facing the cursor on desktop, or turning
 *                        on its own where there's no cursor to face.
 *
 * Everything is damped toward a target rather than assigned directly, so
 * the object eases instead of snapping to the scrollbar. Nothing here
 * touches React state — that would re-render the tree every frame.
 */

// Arrival pose, tuned against a 1536x695 viewport — a real reported window
// size, and deliberately the SHORTEST one this pose needs to stand on its
// own at. A perspective camera's pixels-per-world-unit ratio is driven by
// CSS pixel HEIGHT alone (vertical FOV), so the SAME world-space pose
// renders LARGER in pixels on a taller window, not smaller — while the
// header nav and hero copy both sit at near-fixed pixel offsets. That means
// taller windows push this pose further into the header, the opposite of
// "shorter window = tighter fit" intuition. Confirmed by a screenshot sweep
// from 695 to 2560px height/1440px height combos: this exact pose, used
// as-is, only looks right at REF_HEIGHT — see the one-directional ratio
// compensation below (in useFrame) that shrinks it for every taller
// window instead of letting it drift into the header.
const REF_HEIGHT = 695
const MAX_RATIO_HEIGHT = 1200
const CENTER = { x: 0.15, y: 2.0, z: 0, scale: 0.86 }

// Portrait/narrow viewports (phones) have a much narrower world-space
// frustum than desktop at the same vertical FOV — width scales with
// aspect ratio while height doesn't, so the SAME world-unit scale that
// fits comfortably in a wide desktop window overflows a phone's frustum
// entirely (confirmed by screenshot: the wordmark clipped off both the
// top and right edges at CENTER's desktop values). Tuned separately
// against a real 390x844-class viewport rather than derived by formula.
// y/scale have extra headroom beyond a simple frontal-view fit: at
// near-edge-on angles during auto-rotation, perspective foreshortening on
// this flat wordmark plane makes its near edge swing closer to the camera
// and read taller on screen than its frontal silhouette does — a coarse
// screenshot sweep across the rotation cycle can step right over that
// narrow worst-case angle and look clear when it isn't.
const CENTER_COMPACT = { x: -0.15, y: 1.9, z: 0, scale: 0.34 }
// Below this, use the compact pose — matches the CSS breakpoint the rest
// of the site already treats as "mobile" (index.css `@media (max-width:
// 860px)`), so the switch lines up with layout changes visitors already see.
const COMPACT_BREAKPOINT = 860

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
// Same narrow-frustum problem as CENTER_COMPACT above, applied to the
// docked size.
const DOCK_SCALE_COMPACT = 0.055
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

// Non-interactive (touch/mobile) mode: no cursor to face, so instead the
// object just turns steadily on its own — a display piece on a slow
// turntable rather than a thing reacting to input it doesn't have.
// ~0.28 rad/s is one full turn roughly every 22s, slow enough to read as
// ambient rather than distracting.
const AUTO_ROTATE_SPEED = 0.28

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
 * @param interactive  false on touch devices — swaps the cursor-facing
 *                     rotation for a steady auto-rotate instead, since
 *                     there's no cursor to compute a facing angle from
 */
export default function useLogoChoreography(
  groupRef,
  scrollRef,
  pointerRef,
  { motionOk = true, pointerFxOk = true, onHomeRoute = true, interactive = true } = {}
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

    // Portrait phones get a much narrower frustum at the same vertical FOV
    // (width scales with aspect, height doesn't) — the desktop pose way
    // overflows it. state.size.width is the actual CSS pixel viewport, the
    // same number the site's own CSS breakpoint is written against.
    const compact = state.size.width < COMPACT_BREAKPOINT
    // Desktop-only compensation for the height-vs-pixel-size relationship
    // explained above CENTER — mobile's CENTER_COMPACT was tuned directly
    // against real phone viewports (a much narrower size range in
    // practice) and left as a fixed pose.
    // ONE-DIRECTIONAL on purpose: only ever shrinks the pose (for windows
    // TALLER than REF_HEIGHT), never grows it. REF_HEIGHT is already the
    // tightest-fitting case — the pose was tuned there with barely any
    // margin against the header — so scaling it UP for a shorter window
    // immediately overflows (confirmed by screenshot at 620px). A window
    // shorter than REF_HEIGHT needs no help: the same pixels-per-world-unit
    // relationship that makes taller windows render the pose bigger
    // already renders it smaller (safer) on shorter ones with no
    // adjustment needed. MAX_RATIO_HEIGHT just stops it shrinking to a
    // vanishingly tiny watermark on very tall monitors.
    const effectiveHeight = MathUtils.clamp(state.size.height, REF_HEIGHT, MAX_RATIO_HEIGHT)
    const heightRatio = compact ? 1 : REF_HEIGHT / effectiveHeight
    const center = compact
      ? CENTER_COMPACT
      : { x: CENTER.x * heightRatio, y: CENTER.y * heightRatio, z: CENTER.z, scale: CENTER.scale * heightRatio }
    const dockScale = compact ? DOCK_SCALE_COMPACT : DOCK_SCALE

    if (!motionOk) {
      // Reduced motion: hold a resting pose, no float, no dock, no tilt.
      // Still route-aware — a non-home route shouldn't show the big
      // arrival pose even with motion off.
      if (onHomeRoute) {
        group.position.set(center.x, center.y, center.z)
        group.scale.setScalar(center.scale)
      } else {
        group.position.set(dockedX, dockedY, DOCK_Z)
        group.scale.setScalar(dockScale)
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
    const targetX = MathUtils.lerp(center.x, dockedX, eased) + pointerX * PAN_X
    const targetY =
      MathUtils.lerp(center.y, dockedY, eased) +
      pointerY * PAN_Y +
      Math.sin(t * 0.6) * 0.05 // ambient float
    const targetZ = MathUtils.lerp(center.z, DOCK_Z, eased)
    const targetScale = MathUtils.lerp(center.scale, dockScale, eased) * intro

    // Base turn shared by both modes: unwind on arrival, plus a light
    // settle-turn as it docks into the header.
    const baseRotY = (1 - intro) * -Math.PI * 0.5 + eased * 0.15

    let targetRotY, targetRotX
    if (interactive) {
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
      targetRotY = baseRotY + faceY + Math.sin(t * 0.4) * 0.03
      targetRotX = faceX + Math.sin(t * 0.5) * 0.02
    } else {
      // No cursor to face — turn steadily instead. Damping toward a
      // target that keeps climbing settles into tracking it at a constant
      // offset, which reads as a smooth ease-up into a steady spin rather
      // than a sudden constant-velocity snap.
      targetRotY = baseRotY + t * AUTO_ROTATE_SPEED
      targetRotX = Math.sin(t * 0.5) * 0.02
    }
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
