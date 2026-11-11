// One-off: renders original crescent-moon icons into public/icons. Run: node scripts/make-icons.mjs
import sharp from "sharp";

const crescent = (size) => {
  const c = size / 2;
  const r = size * 0.28;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs><mask id="m"><rect width="${size}" height="${size}" fill="#fff"/><circle cx="${c + r * 0.55}" cy="${c - r * 0.2}" r="${r * 0.85}" fill="#000"/></mask></defs>
    <circle cx="${c}" cy="${c}" r="${r}" fill="#FFFFFF" mask="url(#m)"/>
  </svg>`;
};

const render = async (name, size, radius) => {
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#D9693F"/></svg>`;
  await sharp(Buffer.from(bg)).composite([{ input: Buffer.from(crescent(size)) }]).png().toFile(`public/icons/${name}.png`);
};

await render("icon-192", 192, 40);
await render("icon-512", 512, 108);
await render("maskable-512", 512, 0); // full-bleed; crescent sits inside the 80% safe zone
await render("apple-touch-icon", 180, 0);
console.log("icons written");
