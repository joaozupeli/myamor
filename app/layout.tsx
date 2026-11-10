import type { Metadata, Viewport } from "next"
import { Caveat, Cormorant_Garamond, Inter } from "next/font/google"
import Script from "next/script"
import { content } from "@/content/content"
import "./globals.css"

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
})

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-inter",
  display: "swap",
})

const script = Caveat({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-caveat",
  display: "swap",
})

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
const metadataBase = new URL(host ? `https://${host}` : "http://localhost:3000")

function plain(text: string) {
  return text.replaceAll("*", "")
}

export const metadata: Metadata = {
  metadataBase,
  title: plain(content.title),
  description: plain(content.subtitle),
  robots: { index: false, follow: false },
  openGraph: {
    title: plain(content.title),
    description: plain(content.subtitle),
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: plain(content.title),
    description: plain(content.subtitle),
  },
}

export const viewport: Viewport = {
  themeColor: "#07060A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${sans.variable} ${script.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="motion-flag" strategy="beforeInteractive">
          {`document.documentElement.classList.add("js");try{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("reduced")}}catch(e){}`}
        </Script>
        <noscript>
          <style>{`.word,.hero-letter,.hero-sub,.letter-line,.final-fade,.date-line,.interlude,.branch-node,.stem,.descent-line{opacity:1!important;filter:none!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  )
}
