const sharp = require('sharp');
const fs = require('fs');

async function process(src, dest, targetWidth) {
  try {
    const b = fs.readFileSync(src);
    const out = await sharp(b).resize({width: targetWidth, withoutEnlargement: true}).webp({quality: 85}).toBuffer();
    fs.writeFileSync(dest, out);
    const m = await sharp(dest).metadata();
    console.log('Processed ' + dest + ' -> ' + m.width + 'x' + m.height);
  } catch (e) {
    console.log('Error processing ' + src + ': ' + e.message);
  }
}

async function run() {
  await process('C:/Users/arthu/Downloads/Cerveja Draft Clubs IPA.png', 'ipa-beer-opt.webp', 1000);
  await process('C:/Users/arthu/Downloads/Cerveja Draft Clubs Pilsen.png', 'pilsen-beer-opt.webp', 1000);
  await process('C:/Users/arthu/Downloads/Cerveja Draft Clubs Zero.png', 'zero-beer-opt.webp', 1000);
  await process('C:/Users/arthu/Downloads/Cerveja Draft Clubs Mate.png', 'mate-beer-opt.webp', 1000);
  await process('C:/Users/arthu/Downloads/Cerveja Draft Clubs Abacaxi.png', 'pineapple-draft-opt.webp', 1000);
  await process('C:/Users/arthu/Downloads/Cerveja Draft Clubs Red.png', 'red-draft-opt.webp', 1000);
  await process('C:/Users/arthu/Downloads/Cerveja Draft Clubs Ultra.png', 'ultra-beer-opt.webp', 1000);

  await process('C:/Users/arthu/Downloads/FOTO EMPORIO 2.jpg', 'fotoo2-opt.webp', 1500);
  await process('C:/Users/arthu/Downloads/FOTO EMPORIO 3.jpg', 'fotoo3-opt.webp', 1500);
  await process('C:/Users/arthu/Downloads/FOTO EMPORIO 4.jpg', 'fotoo4-opt.webp', 1500);

  await process('C:/Users/arthu/Downloads/MATHAJJ DJ.webp', 'mathajj.webp', 1000);
  await process('C:/Users/arthu/Downloads/LUKETA DJ.webp', 'luketa.webp', 1000);
}

run();
