// Fixed film-grain texture over the whole app. Pure CSS/SVG, no motion,
// so it doesn't need to be a motion component.
export default function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />
}
