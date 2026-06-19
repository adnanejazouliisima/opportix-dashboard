// Génère les icônes PWA (192, 512, apple-touch 180) à partir de public/favicon.svg.
// Le logo "O" violet est centré sur un fond sombre (#1A1A1A, couleur de l'en-tête),
// en pleine page pour rester correct en icône "maskable".
// Lancer avec : npm run icons
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const favicon = join(pub, 'favicon.svg');

// Construit une icône carrée de `size` px : fond sombre + "O" centré (~56 %).
async function icon(size, out) {
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#1A1A1A"/></svg>`
  );
  const mark = await sharp(favicon, { density: 512 })
    .resize(Math.round(size * 0.56))
    .png()
    .toBuffer();
  await sharp(bg).composite([{ input: mark, gravity: 'center' }]).png().toFile(join(pub, out));
}

async function run() {
  await icon(512, 'icon-512.png');
  await icon(192, 'icon-192.png');
  await icon(180, 'apple-touch-icon.png');
  console.log('Icônes générées : icon-512.png, icon-192.png, apple-touch-icon.png');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
