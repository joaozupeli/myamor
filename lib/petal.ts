import * as THREE from "three"

const cache = new Map<string, THREE.BufferGeometry>()

function smooth(value: number, edge0: number, edge1: number) {
  const amount = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return amount * amount * (3 - 2 * amount)
}

export function getPetalGeometry(detail: number, palette: [string, string, string]) {
  const key = `${detail}:${palette.join(":")}`
  const existing = cache.get(key)
  if (existing) return existing

  const height = 1.42
  const geo = new THREE.PlaneGeometry(1, height, detail, Math.round(detail * 1.35))
  geo.translate(0, height / 2, 0)

  const position = geo.attributes.position
  const uv = geo.attributes.uv
  if (!position || !uv) return geo

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const y = position.getY(index)
    const along = THREE.MathUtils.clamp(y / height, 0, 1)
    const width = Math.max(0.075, Math.sin(Math.PI * Math.pow(along, 0.68)))
    const nextX = x * width
    const curl = Math.pow(along, 1.8)
    const cup = nextX * nextX * 1.2 * (1.08 - along * 0.28)
    position.setXYZ(index, nextX, y - curl * 0.3, cup - curl * 0.66)
  }

  position.needsUpdate = true
  geo.computeVertexNormals()

  const colors = new Float32Array(position.count * 3)
  const base = new THREE.Color(palette[0])
  const mid = new THREE.Color(palette[1])
  const tip = new THREE.Color(palette[2])
  const color = new THREE.Color()

  for (let index = 0; index < position.count; index += 1) {
    const along = uv.getY(index)
    color.copy(base).lerp(mid, smooth(along, 0.04, 0.62))
    color.lerp(tip, smooth(along, 0.52, 1))
    colors[index * 3] = color.r
    colors[index * 3 + 1] = color.g
    colors[index * 3 + 2] = color.b
  }

  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  cache.set(key, geo)
  return geo
}

export function getStemGeometry() {
  const existing = cache.get("stem")
  if (existing) return existing

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.02, 0),
    new THREE.Vector3(0.035, -0.72, 0.02),
    new THREE.Vector3(-0.045, -1.5, -0.015),
    new THREE.Vector3(0.03, -2.25, 0.02),
    new THREE.Vector3(-0.01, -3.15, 0),
  ])
  const geo = new THREE.TubeGeometry(curve, 56, 0.024, 7, false)
  cache.set("stem", geo)
  return geo
}
