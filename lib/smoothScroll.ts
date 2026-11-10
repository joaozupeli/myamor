"use client"

import Lenis from "lenis"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import { setScrollSample } from "@/lib/motion"

let lenis: Lenis | null = null

export function getLenis() {
  return lenis
}

export function startSmoothScroll() {
  const next = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1,
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
