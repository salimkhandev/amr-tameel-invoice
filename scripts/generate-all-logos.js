const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateAll() {
  const publicDir = path.join(__dirname, '..', 'public');
  const originalLogoPath = path.join(publicDir, 'amar-logo.png');
  const backupLogoPath = path.join(publicDir, 'amar-logo.original.png');

  if (!fs.existsSync(backupLogoPath)) {
    fs.copyFileSync(originalLogoPath, backupLogoPath);
    console.log('Backed up original logo to amar-logo.original.png');
  }

  // Extract the truck portion (top 355px) from the original logo
  const truckBuffer = await sharp(backupLogoPath)
    .extract({ left: 0, top: 0, width: 490, height: 355 })
    .toBuffer();

  // Create SVG with "ذاكر تحميل" in bold Arabic styling
  const svgText = `
    <svg width="490" height="155" viewBox="0 0 490 155" xmlns="http://www.w3.org/2000/svg">
      <style>
        .arabic-text {
          font-family: 'Cairo', 'Amiri', 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
          font-size: 78px;
          font-weight: 800;
          fill: #1f2328;
          text-anchor: middle;
          dominant-baseline: central;
        }
      </style>
      <text x="245" y="75" class="arabic-text" direction="rtl">ذاكر تحميل</text>
    </svg>
  `;

  // Composite onto 490x510 transparent canvas
  const newLogoBuffer = await sharp({
    create: {
      width: 490,
      height: 510,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    }
  })
  .composite([
    { input: truckBuffer, top: 0, left: 0 },
    { input: Buffer.from(svgText), top: 355, left: 0 }
  ])
  .png()
  .toBuffer();

  // Write new amar-logo.png
  fs.writeFileSync(originalLogoPath, newLogoBuffer);
  console.log('Successfully wrote new public/amar-logo.png with ذاكر تحميل');

  // Also create zakir-logo.png for direct reference
  fs.writeFileSync(path.join(publicDir, 'zakir-logo.png'), newLogoBuffer);

  // Generate PWA icons
  const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
  for (const size of ICON_SIZES) {
    await sharp(newLogoBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(publicDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  // Generate Apple touch icons
  const APPLE_SIZES = [57, 60, 72, 76, 114, 120, 144, 152, 167, 180, 1024];
  for (const size of APPLE_SIZES) {
    await sharp(newLogoBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(publicDir, `apple-touch-icon-${size}.png`));
    console.log(`Generated apple-touch-icon-${size}.png`);
  }

  // Generate Favicons
  const FAVICON_SIZES = [16, 32, 48];
  for (const size of FAVICON_SIZES) {
    await sharp(newLogoBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(publicDir, `favicon-${size}.png`));
    console.log(`Generated favicon-${size}.png`);
  }

  console.log('All icons and logos regenerated successfully!');
}

generateAll().catch(console.error);
