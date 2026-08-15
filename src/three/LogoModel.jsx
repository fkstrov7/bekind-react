import { useLayoutEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Vector3 } from 'three'

export const MODEL_URL = '/bekind3dmesh.glb'

// Self-hosted Draco decoder (copied from three/examples into public/draco).
// Passing the path here keeps the hero off drei's default Google CDN, so
// rendering never depends on a third party at runtime.
const DRACO_PATH = '/draco/'

/**
 * The real logo. Blender authors it at roughly 0.13 units wide, so we
 * measure the loaded scene and normalise it rather than hard-coding a
 * scale that would silently break if the export changes.
 *
 * Base colours are left exactly as authored — they come from the SVG
 * import in Blender. Metalness/roughness are NOT left as authored; see the
 * comment below.
 */
export default function LogoModel({ targetWidth = 2.6 }) {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH)

  // Clone so repeated mounts don't fight over one shared scene graph.
  const model = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    if (!model) return

    // The export's Blender scene had a background "Plane" as a SIBLING
    // root object (not parented under the logo's Empty rig), sitting far
    // outside the logo's own bounds. Left in, it would dominate the Box3
    // below and scale the actual logo down to near-invisible. Stripping it
    // by name is more robust than asking for a re-export every time.
    const stray = model.getObjectByName('Plane')
    stray?.removeFromParent()

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true

        if (child.material) {
          // The export's materials omit metallicFactor, which the glTF
          // spec defaults to 1.0 (fully metallic). A metal with no
          // environment map reflects almost nothing but tiny direct
          // highlights, so the logo rendered as functionally invisible —
          // not a look anyone chose, just an unset PBR field. Clone (the
          // material is cached and shared by useGLTF) and pin it to a
          // matte "paper poster" finish that matches the flat SVG colours.
          const mat = child.material.clone()
          mat.metalness = 0.04
          mat.roughness = 0.6
          child.material = mat
        }
      }
    })

    // Two passes on purpose. An object's `position` lives in PARENT space
    // and isn't affected by its own `scale`, so centring before scaling
    // would leave the offset at the wrong magnitude. Scale first, measure
    // again, then centre.
    model.position.set(0, 0, 0)
    model.scale.setScalar(1)
    // Blender's SVG import sits flat in its XY plane, and the exporter's
    // Z-up -> Y-up conversion carries that straight through: the logo's
    // face normal ends up pointing along +Y ("lying on a table") instead
    // of +Z (facing the camera). Stand it up before measuring, so X/Y in
    // the Box3 below are the actual face-plane dimensions. +PI/2, not
    // -PI/2: the negative direction turns the face to -Z, away from the
    // camera, so the extrusion's back was on screen — mirrored and
    // reading as upside down.
    model.rotation.set(Math.PI / 2, 0, 0)

    const bounds = new Box3().setFromObject(model)
    const size = bounds.getSize(new Vector3())
    const widest = Math.max(size.x, size.y, 0.0001)
    model.scale.setScalar(targetWidth / widest)

    const scaledBounds = new Box3().setFromObject(model)
    model.position.sub(scaledBounds.getCenter(new Vector3()))
  }, [model, targetWidth])

  return <primitive object={model} />
}

// Warms the cache as soon as this module is imported (i.e. once
// BrandObject's lazy import resolves), so the model is usually already
// loading before LogoModel itself gets a chance to mount.
useGLTF.preload(MODEL_URL, DRACO_PATH)
