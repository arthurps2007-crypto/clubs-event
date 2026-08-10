const sharp = require('sharp');
const fs = require('fs');

async function resizeImage(file, width) {
  try {
    if (!fs.existsSync(file)) return;
    const inputBuffer = fs.readFileSync(file);
    const outputBuffer = await sharp(inputBuffer).resize({ width }).webp({ quality: 80 }).toBuffer();
    fs.writeFileSync(file, outputBuffer);
    console.log(`Resized ${file} to width ${width}`);
  } catch (err) {
    console.error(`Error resizing ${file}:`, err);
  }
}

async function run() {
  const beers = ['pilsen-beer-opt.webp', 'ultra-beer-opt.webp', 'zero-beer-opt.webp', 'red-draft-opt.webp', 'mate-beer-opt.webp', 'ipa-beer-opt.webp', 'pineapple-draft-opt.webp'];
  for (const b of beers) await resizeImage(b, 600);

  const lineup = ['veigh.webp', 'ryu.webp', 'hariel.webp', 'mathajj.webp', 'luketa.webp'];
  for (const l of lineup) await resizeImage(l, 800);

  const photos = ['fotoo2-opt.webp', 'fotoo3-opt.webp', 'fotoo4-opt.webp'];
  for (const p of photos) await resizeImage(p, 1200);
}

run();
