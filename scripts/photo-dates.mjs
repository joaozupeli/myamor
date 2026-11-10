import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = "public/photos";
const skip = new Set([
  "01.jpg",
  "02.jpg",
  "03.jpg",
  "04.jpg",
  "05.jpg",
  "casa.jpg",
  "encontro.jpg",
  "noite.jpg",
  "perto.jpg",
  "rosa.jpg",
]);

const files = fs.readdirSync(dir).filter((file) => !skip.has(file));

for (const file of files) {
  const full = path.join(dir, file);
  try {
    const meta = await sharp(full, { failOn: "none" }).metadata();
    const text = meta.exif ? meta.exif.toString("latin1") : "";
    const match = text.match(/20[12]\d:[01]\d:[0-3]\d [0-2]\d:[0-5]\d:[0-5]\d/);
    console.log(
      [
        String(meta.width || "?") + "x" + String(meta.height || "?"),
        match ? match[0] : "no-date",
        file,
      ].join(" | "),
    );
  } catch (error) {
    console.log("err | " + error.message.slice(0, 100) + " | " + file);
  }
}
