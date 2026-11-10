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
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const mobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 820
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const saveData = Boolean(nav.connection?.saveData)
  const weak = saveData || cores <= 2 || memory <= 2

  if (reduced || weak) {
    return {
      showWebgl: false,
      bloom: false,
      dpr: 1,
      lite: true,
      particles: reduced ? 8 : 16,
      petals: 16,
      reduced,
    }
  }

  if (mobile || memory <= 4 || cores <= 4) {
    return {
      showWebgl: true,
      bloom: false,
      dpr: 1.5,
      lite: true,
      particles: 28,
      petals: 24,
      reduced: false,
    }
  }

  return {
    showWebgl: true,
    bloom: true,
    dpr: Math.min(2, window.devicePixelRatio || 1),
    lite: false,
    particles: 60,
    petals: 42,
    reduced: false,
  }
}
