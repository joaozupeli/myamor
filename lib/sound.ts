let context: AudioContext | null = null
let master: GainNode | null = null
let analyser: AnalyserNode | null = null
let pulseData = new Uint8Array(0)
let muted = false
let level = 0.82
const listeners = new Set<(isMuted: boolean) => void>()

function targetGain() {
  return muted ? 0 : level
}

function rampTo(value: number, seconds: number) {
  if (!context || !master) return
  const now = context.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setValueAtTime(master.gain.value, now)
  master.gain.linearRampToValueAtTime(value, now + seconds)
}

export function startStorySound(src: string) {
  if (context) {
    void context.resume()
    return
  }

  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return

  context = new AudioCtx()
  master = context.createGain()
  master.gain.setValueAtTime(0, context.currentTime)
  analyser = context.createAnalyser()
  analyser.fftSize = 64
  analyser.smoothingTimeConstant = 0.82
  pulseData = new Uint8Array(analyser.frequencyBinCount)
  master.connect(analyser)
  analyser.connect(context.destination)
  rampTo(targetGain(), 3)
  void context.resume()

  const audio = new Audio(src)
  audio.loop = true
  audio.preload = "auto"
  const source = context.createMediaElementSource(audio)
  source.connect(master)
  void audio.play().catch(() => {})
}

export function setStoryLevel(next: number) {
  level = next
  rampTo(targetGain(), 1.15)
}

export function toggleStorySound() {
  muted = !muted
  rampTo(targetGain(), 0.45)
  listeners.forEach((listener) => listener(muted))
  return muted
}

export function subscribeSound(listener: (isMuted: boolean) => void) {
  listeners.add(listener)
  listener(muted)
  return () => {
    listeners.delete(listener)
  }
}

export function getStoryPulse() {
  if (!analyser || pulseData.length === 0) return 0
  analyser.getByteFrequencyData(pulseData)
  const bins = Math.min(6, pulseData.length)
  let sum = 0
  for (let index = 0; index < bins; index += 1) sum += pulseData[index] ?? 0
  return sum / (bins * 255)
}

