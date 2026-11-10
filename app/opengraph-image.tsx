import { ImageResponse } from "next/og"
import { content } from "@/content/content"

export const alt = "A nossa história"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  const title = content.title.replaceAll("*", "")

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#07060A",
          color: "#F3ECE6",
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 110,
            display: "flex",
            background:
              "radial-gradient(circle, #FFE6D0 0%, #FF3B55 18%, #C8102E 42%, rgba(232,195,158,0.15) 64%, rgba(7,6,10,0) 72%)",
          }}
        />
        <div style={{ fontSize: 84, marginTop: 12, letterSpacing: -2 }}>{title}</div>
        <div style={{ fontSize: 28, marginTop: 18, color: "rgba(243,236,230,0.72)" }}>
          {content.subtitle}
        </div>
      </div>
    ),
    { ...size },
  )
}
