export function HoodieIcon(props) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      <path d="M20 12h24l6 10-8 4v26H22V26l-8-4z" />
      <path d="M20 12l-4 6M44 12l4 6" />
    </svg>
  )
}

export function TeeIcon(props) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      <path d="M16 14h32v36H16z" />
      <path d="M16 22h32M24 14v8M40 14v8" />
    </svg>
  )
}

export function CapIcon(props) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      <path d="M12 30c0-11 9-18 20-18s20 7 20 18" />
      <path d="M10 30h44v6H10z" />
      <path d="M24 12c2-4 14-4 16 0" />
    </svg>
  )
}

export function CrewneckIcon(props) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      <path d="M18 14h28l6 10-8 4v24H20V28l-8-4z" />
      <circle cx="32" cy="34" r="6" />
    </svg>
  )
}

export const iconMap = {
  hoodie: HoodieIcon,
  tee: TeeIcon,
  cap: CapIcon,
  crewneck: CrewneckIcon,
}
