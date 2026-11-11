// One-off: crops the three cat portraits from the household photos into public/cats/*.webp (square, 640px).
// Usage: node scripts/make-cats.mjs <dir-with-originals>. Crops show only the cat (no rooms, windows or people).
import sharp from "sharp";
import path from "node:path";

const [dir] = process.argv.slice(2);
if (!dir) throw new Error("usage: node scripts/make-cats.mjs <originals-dir>");

const jobs = [
  { id: "ginger", file: "z1/WhatsApp Image 2026-11-11 at 18.45.09.jpeg", cx: 0.52, cy: 0.37, size: 0.78 },
  { id: "tabby", file: "z2/WhatsApp Image 2026-11-11 at 18.45.45 (1).jpeg", cx: 0.57, cy: 0.455, size: 0.40 },
  { id: "birman", file: "z3/WhatsApp Image 2026-11-11 at 18.48.15.jpeg", cx: 0.52, cy: 0.41, size: 0.68 },
];

for (const j of jobs) {
  const src = path.join(dir, j.file);
  const { width: w, height: h } = await sharp(src).rotate().metadata();
  const side = Math.round(Math.min(w, h) * j.size * (w < h ? 1 : 1));
  const s = Math.min(side, w, h);
  const left = Math.max(0, Math.min(w - s, Math.round(w * j.cx - s / 2)));
  const top = Math.max(0, Math.min(h - s, Math.round(h * j.cy - s / 2)));
  await sharp(src).rotate().extract({ left, top, width: s, height: s }).resize(640, 640).webp({ quality: 80 }).toFile(`public/cats/${j.id}.webp`);
  console.log(j.id, `${w}x${h}`, { left, top, s });
}
