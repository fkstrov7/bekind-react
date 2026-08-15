import { Component } from 'react'

/**
 * Catches a failed model load (missing file, bad export, decoder error)
 * and renders the fallback instead of taking the page down with it.
 *
 * This has to be a class — React still has no hook equivalent for
 * componentDidCatch.
 */
export default class ModelBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    // Worth surfacing: until bekind3d.glb is exported this is the expected
    // path, and it's the first thing to check if the logo doesn't appear.
    console.warn('[BeKind] 3D logo failed to load, using fallback:', error?.message || error)
    this.props.onFail?.(error)
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}
