"use client"

import Lenis from "lenis"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import { setScrollSample } from "@/lib/motion"

let lenis: Lenis | null = null

export function getLenis() {
  return lenis
}

export function startSmoothScroll(reduced: boolean) {
  if (reduced) {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max <= 0 ? 0 : window.scrollY / max
      setScrollSample(progress, 0)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }

  const next = new Lenis({
    lerp: 0.065,
    smoothWheel: true,
    syncTouch: true,
    wheelMultiplier: 0.32,
    touchMultiplier: 0.55,
    autoRaf: false,
  })
  lenis = next

  next.on("scroll", (event) => {
    ScrollTrigger.update()
    setScrollSample(event.progress, event.velocity)
  })

  const ticker = (time: number) => {
    next.raf(time * 1000)
  }
  gsap.ticker.add(ticker)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(ticker)
    next.destroy()
    if (lenis === next) lenis = null
  }
}
