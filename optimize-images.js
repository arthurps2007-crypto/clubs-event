const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, 'public');

async function compress(file, opts = {}) {
  const src = path.join(PUBLIC, file);
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, ext);
  const outFile = opts.outName || base + '.webp';
  const outPath = path.join(PUBLIC, outFile);
  
  if (!fs.existsSync(src)) {
    console.log(`⚠️  SKIP: ${file} não existe`);
    return;
  }

  const sizeBefore = fs.statSync(src).size;
  
  let pipeline = sharp(src);
  
  // Resize if specified
  if (opts.width || opts.height) {
    pipeline = pipeline.resize(opts.width, opts.height, { 
      fit: 'inside', 
      withoutEnlargement: true 
    });
  }
  
  // Convert to WebP
  pipeline = pipeline.webp({ quality: opts.quality || 75 });
  
  await pipeline.toFile(outPath);
  
  const sizeAfter = fs.statSync(outPath).size;
  const saved = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
  console.log(`✅ ${file} (${(sizeBefore/1024).toFixed(0)}KB) → ${outFile} (${(sizeAfter/1024).toFixed(0)}KB) [-${saved}%]`);
}

async function main() {
  console.log('🚀 Iniciando compressão de imagens...\n');

  // 1. HERO BANNERS — resize to actual display size
  await compress('hero-desktop.jpg', { width: 1920, quality: 78, outName: 'hero-desktop.webp' });
  await compress('hero-mobile.jpg', { width: 768, quality: 78, outName: 'hero-mobile.webp' });

  // 2. BEER/FLAVOR IMAGES — displayed at max 400x400 on desktop
  const beers = ['pilsen-beer.webp', 'ultra-beer.webp', 'zero-beer.webp', 'red-draft.webp', 'ipa-beer.webp', 'pineapple-draft.webp', 'mate-beer.webp'];
  for (const beer of beers) {
    const base = path.basename(beer, '.webp');
    // Save optimized version with -opt suffix, then replace original
    await compress(beer, { width: 500, height: 500, quality: 72, outName: base + '-opt.webp' });
  }

  // 3. LINEUP IMAGES (artists) — displayed at ~320x415 max
  await compress('hariel.png', { width: 500, quality: 75, outName: 'hariel.webp' });
  await compress('ryu.png', { width: 500, quality: 75, outName: 'ryu.webp' });
  await compress('veigh.jpg', { width: 500, quality: 75, outName: 'veigh.webp' });

  // 4. BACKGROUND IMAGES
  await compress('bg-lineup.jpeg', { width: 1920, quality: 65, outName: 'bg-lineup.webp' });
  await compress('bg-roxo.webp', { width: 1920, quality: 65, outName: 'bg-roxo-opt.webp' });
  await compress('bg-sabores.webp', { width: 1920, quality: 65, outName: 'bg-sabores-opt.webp' });

  // 5. GALLERY PHOTOS — displayed at ~861x400 max
  await compress('fotoo2.webp', { width: 900, quality: 72, outName: 'fotoo2-opt.webp' });
  await compress('fotoo3.webp', { width: 900, quality: 72, outName: 'fotoo3-opt.webp' });
  await compress('fotoo4.webp', { width: 900, quality: 72, outName: 'fotoo4-opt.webp' });

  console.log('\n🎉 Compressão finalizada!');
}

main().catch(console.error);
