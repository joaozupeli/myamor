const roots = [
  { d: "M100 0 C 97 90, 106 180, 100 280 C 92 390, 110 500, 100 640 C 96 720, 104 770, 100 800", width: 7 },
  { d: "M100 40 C 86 110, 74 170, 78 250 C 82 330, 70 390, 76 470", width: 4.2 },
  { d: "M78 250 C 62 300, 58 350, 66 430", width: 2.2 },
  { d: "M76 470 C 64 520, 60 570, 70 640", width: 1.6 },
  { d: "M100 60 C 116 130, 132 190, 126 270 C 120 350, 136 420, 128 510", width: 4 },
  { d: "M126 270 C 142 320, 146 370, 136 450", width: 2 },
  { d: "M128 510 C 140 560, 136 620, 124 690", width: 1.6 },
  { d: "M100 300 C 84 370, 72 450, 80 540 C 86 610, 74 670, 82 750", width: 3.4 },
  { d: "M80 540 C 66 590, 70 640, 62 710", width: 1.7 },
  { d: "M100 340 C 118 410, 134 480, 124 570 C 116 650, 132 710, 122 790", width: 3.2 },
  { d: "M124 570 C 138 620, 142 670, 132 740", width: 1.6 },
  { d: "M100 120 C 104 200, 94 280, 102 380", width: 2.4 },
  { d: "M100 480 C 96 560, 108 650, 100 760", width: 2.2 },
]

export function DownRoot() {
  return (
    <svg
      className="pointer-events-none absolute top-0 left-0 z-0 h-full w-11 lg:left-1/2 lg:w-32 lg:-translate-x-1/2"
      viewBox="0 0 200 800"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      {roots.map((root) => (
        <path
          key={root.d}
          d={root.d}
          stroke="#E8C39E"
          strokeWidth={root.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}
