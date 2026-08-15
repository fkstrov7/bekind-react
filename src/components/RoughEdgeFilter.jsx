// Hidden SVG housing the feTurbulence/feDisplacementMap filter referenced
// by `.manifesto-card { filter: url(#roughEdge) }` in index.css. Needs to
// exist once anywhere in the DOM for the CSS reference to resolve.
export default function RoughEdgeFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="roughEdge">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="2" result="noise" seed="7" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
      </filter>
    </svg>
  )
}
