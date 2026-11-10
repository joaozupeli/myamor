"use client"

import { useEffect, useRef } from "react"

export function GrainOverlay() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const canvas = document.createElement("canvas")
    canvas.width = 160
    canvas.height = 160
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const image = ctx.createImageData(160, 160)
    for (let index = 0; index < image.data.length; index += 4) {
      const shade = 80 + Math.random() * 175
      image.data[index] = shade
      image.data[index + 1] = shade
      image.data[index + 2] = shade
      image.data[index + 3] = 255
    }
    ctx.putImageData(image, 0, 0)
    node.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`
  }, [])

  return <div ref={ref} className="grain" aria-hidden="true" />
}
