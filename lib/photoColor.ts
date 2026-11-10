const cache = new Map<string, string>()

export function readPhotoColor(src: string) {
  const saved = cache.get(src)
  if (saved) return Promise.resolve(saved)

  return new Promise<string>((resolve) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) {
        resolve("#C8102E")
        return
      }
      canvas.width = 12
      canvas.height = 12
      ctx.drawImage(image, 0, 0, 12, 12)
      const pixels = ctx.getImageData(0, 0, 12, 12).data
      let red = 0
      let green = 0
      let blue = 0
      let count = 0
      for (let index = 0; index < pixels.length; index += 4) {
        red += pixels[index]
        green += pixels[index + 1]
        blue += pixels[index + 2]
        count += 1
      }
      const lift = (channel: number) => Math.min(255, Math.round(78 + (channel / count) * 0.95))
      const color = `rgb(${lift(red)}, ${lift(green)}, ${lift(blue)})`
      cache.set(src, color)
      resolve(color)
    }
    image.onerror = () => resolve("#C8102E")
    image.src = src
  })
}
