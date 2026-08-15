/**
 * Shown instead of the 3D logo on phones, under reduced motion, and when
 * WebGL or the model itself is unavailable.
 *
 * It sits inside the hero rather than in a fixed layer, so it simply
 * scrolls away — a static image that followed you down the page would read
 * as a mistake rather than as the docked 3D object it stands in for.
 */
export default function LogoFallback() {
  return (
    <img
      className="logo-fallback"
      src="/logo-fallback.png"
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  )
}
