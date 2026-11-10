import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();

function svg(body, seed) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1125" viewBox="0 0 900 1125">
  <defs>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed}"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer>
    </filter>
  </defs>
  <rect width="900" height="1125" fill="#07060A"/>
  ${body}
  <rect width="900" height="1125" filter="url(#grain)" opacity="0.28"/>
  <rect width="900" height="1125" fill="url(#none)"/>
</svg>`;
}

const stills = {
  "encontro.jpg": svg(`
    <radialGradient id="a" cx="38%" cy="62%" r="18%"><stop offset="0%" stop-color="#E8C39E"/><stop offset="100%" stop-color="#E8C39E" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="62%" cy="66%" r="16%"><stop offset="0%" stop-color="#FF3B55"/><stop offset="55%" stop-color="#C8102E" stop-opacity="0.4"/><stop offset="100%" stop-color="#C8102E" stop-opacity="0"/></radialGradient>
    <rect width="900" height="1125" fill="#14070C"/>
    <ellipse cx="450" cy="860" rx="280" ry="46" fill="#1A0C10"/>
    <circle cx="340" cy="700" r="150" fill="url(#a)"/>
    <circle cx="560" cy="730" r="130" fill="url(#b)"/>
    <rect x="300" y="760" width="70" height="90" rx="30" fill="#2A1614"/>
    <rect x="530" y="780" width="64" height="84" rx="28" fill="#241014"/>
    <circle cx="180" cy="240" r="40" fill="#E8C39E" opacity="0.08"/>
    <circle cx="700" cy="180" r="70" fill="#C8102E" opacity="0.08"/>
  `, 2),
  "noite.jpg": svg(`
    <rect width="900" height="1125" fill="#0C070A"/>
    <rect x="560" y="180" width="150" height="220" fill="#E8C39E" opacity="0.16"/>
    <rect x="590" y="210" width="90" height="150" fill="#FF3B55" opacity="0.18"/>
    ${Array.from({ length: 28 }, (_, index) => {
      const x = 40 + (index * 37) % 820;
      return `<line x1="${x}" y1="0" x2="${x - 30}" y2="1125" stroke="#F3ECE6" stroke-opacity="0.08" stroke-width="1"/>`;
    }).join("")}
    <circle cx="220" cy="860" r="180" fill="#5A0F1F" opacity="0.25"/>
  `, 4),
  "perto.jpg": svg(`
    <radialGradient id="l" cx="40%" cy="48%" r="28%"><stop offset="0%" stop-color="#F3ECE6"/><stop offset="35%" stop-color="#E8C39E"/><stop offset="100%" stop-color="#E8C39E" stop-opacity="0"/></radialGradient>
    <radialGradient id="r" cx="62%" cy="54%" r="26%"><stop offset="0%" stop-color="#FF3B55"/><stop offset="40%" stop-color="#C8102E"/><stop offset="100%" stop-color="#C8102E" stop-opacity="0"/></radialGradient>
    <rect width="900" height="1125" fill="#10080C"/>
    <circle cx="360" cy="540" r="230" fill="url(#l)"/>
    <circle cx="560" cy="600" r="210" fill="url(#r)"/>
  `, 6),
  "casa.jpg": svg(`
    <rect width="900" height="1125" fill="#09070A"/>
    <rect x="230" y="220" width="440" height="560" fill="#140C10"/>
    <rect x="280" y="280" width="150" height="220" fill="#E8C39E" opacity="0.55"/>
    <rect x="470" y="280" width="150" height="220" fill="#C8102E" opacity="0.28"/>
    <rect x="345" y="300" width="20" height="180" fill="#07060A" opacity="0.35"/>
    <rect x="250" y="860" width="400" height="16" fill="#2A0A14"/>
    <circle cx="450" cy="180" r="90" fill="#E8C39E" opacity="0.05"/>
  `, 8),
  "rosa.jpg": svg(`
    <radialGradient id="g" cx="50%" cy="48%" r="42%"><stop offset="0%" stop-color="#FF3B55"/><stop offset="40%" stop-color="#C8102E" stop-opacity="0.4"/><stop offset="100%" stop-color="#07060A" stop-opacity="0"/></radialGradient>
    <linearGradient id="p" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#5A0F1F"/><stop offset="50%" stop-color="#C8102E"/><stop offset="100%" stop-color="#FF8A98"/></linearGradient>
    <rect width="900" height="1125" fill="#12080C"/>
    <circle cx="450" cy="560" r="300" fill="url(#g)"/>
    ${[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle) => `<ellipse cx="450" cy="430" rx="70" ry="150" fill="url(#p)" opacity="0.9" transform="rotate(${angle} 450 560)"/>`).join("")}
    ${[15, 85, 155, 225, 295].map((angle) => `<ellipse cx="450" cy="490" rx="42" ry="90" fill="#FF3B55" transform="rotate(${angle} 450 560)"/>`).join("")}
    <circle cx="450" cy="560" r="28" fill="#F3ECE6"/>
  `, 3),
};

const photoDir = path.join(root, "public", "photos");
fs.mkdirSync(photoDir, { recursive: true });

const blur = {};
for (const [name, markup] of Object.entries(stills)) {
  const file = path.join(photoDir, name);
  await sharp(Buffer.from(markup)).jpeg({ quality: 78, mozjpeg: true }).toFile(file);
  const tiny = await sharp(file).resize(16, 20).jpeg({ quality: 40 }).toBuffer();
  blur[`/photos/${name}`] = `data:image/jpeg;base64,${tiny.toString("base64")}`;
}

const lines = Object.entries(blur).map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`);
fs.writeFileSync(path.join(root, "lib", "imageBlur.ts"), `export const imageBlur: Record<string, string> = {\n${lines.join("\n")}\n};\n`);
console.log("stills ready");
