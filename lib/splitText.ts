export function splitWords(element: HTMLElement) {
  const original = element.textContent ?? ""
  const parts = original.split(/(\s+)/)
  element.textContent = ""
  const words: HTMLSpanElement[] = []

  for (const part of parts) {
    if (part.length === 0) continue
    if (/^\s+$/.test(part)) {
      element.append(document.createTextNode(part))
      continue
    }
    const span = document.createElement("span")
    span.textContent = part
    span.style.display = "inline-block"
    element.append(span)
    words.push(span)
  }

  return {
    words,
    restore() {
      element.textContent = original
    },
  }
}

export function splitLetters(element: HTMLElement) {
  const original = element.textContent ?? ""
  element.textContent = ""
  const letters: HTMLSpanElement[] = []

  for (const char of Array.from(original)) {
    const span = document.createElement("span")
    span.textContent = char === " " ? "\u00A0" : char
    span.style.display = "inline-block"
    element.append(span)
    letters.push(span)
  }

  return {
    letters,
    restore() {
      element.textContent = original
    },
  }
}
