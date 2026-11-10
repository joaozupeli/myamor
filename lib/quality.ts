export type Quality = {
  showWebgl: boolean
  bloom: boolean
  dpr: number
  lite: boolean
  particles: number
  petals: number
  reduced: boolean
}

export function detectQuality(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const mobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 820
  const cores = navigator.hardwareConcurrency ?? 8
  const memory = nav.deviceMemory ?? 8
  const tight = mobile || cores <= 4 || memory <= 4

  if (tight) {
    return {
      showWebgl: true,
      bloom: false,
      dpr: Math.min(1.5, window.devicePixelRatio || 1),
      lite: true,
      particles: mobile ? 24 : 36,
      petals: mobile ? 18 : 28,
      reduced: false,
    }
  }

  return {
    showWebgl: true,
    bloom: true,
    dpr: Math.min(1.75, window.devicePixelRatio || 1),
    lite: false,
    particles: 60,
    petals: 42,
    reduced: false,
  }
}
