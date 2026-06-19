// One-off: rasterize public/icon.svg into PNG app icons (192 & 512) for PWA.
// Run with: node scripts/gen-icons.mjs   (needs `sharp` installed)
import sharp from "sharp";

const src = "public/icon.svg";
const sizes = [192, 512];

for (const size of sizes) {
  await sharp(src, { density: 512 })
    .resize(size, size)
    .png()
    .toFile(`public/icon-${size}.png`);
  console.log(`generated public/icon-${size}.png`);
}
