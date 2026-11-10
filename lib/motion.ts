export const motion = {
  tiltX: 0,
  tiltY: 0,
  velocity: 0,
  progress: 0,
  finale: 0,
  roseBoost: 0,
  orientation: false,
}

const progressListeners = new Set<(value: number) => void>()

export function setTilt(x: number, y: number) {
  motion.tiltX = x
  motion.tiltY = y
}

export function setScrollSample(progress: number, velocity: number) {
  motion.progress = progress
  motion.velocity = velocity
  progressListeners.forEach((listener) => listener(progress))
}

export function subscribeProgress(listener: (value: number) => void) {
  progressListeners.add(listener)
  listener(motion.progress)
  return () => {
    progressListeners.delete(listener)
  }
}

export function pulseRose() {
  motion.roseBoost = 1
}

export function decayRose(delta: number) {
  motion.roseBoost = Math.max(0, motion.roseBoost - delta * 0.12)
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function onOrientation(event: DeviceOrientationEvent) {
  const gamma = event.gamma ?? 0
  const beta = event.beta ?? 45
  motion.orientation = true
  setTilt(clamp((beta - 45) / 70, -0.22, 0.22), clamp(gamma / 55, -0.28, 0.28))
}

export async function requestTilt() {
  const orientation = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<"granted" | "denied">
  }

  if (typeof orientation.requestPermission === "function") {
    try {
      const result = await orientation.requestPermission()
      if (result !== "granted") return
    } catch {
      return
    }
  }

  window.addEventListener("deviceorientation", onOrientation)
}
