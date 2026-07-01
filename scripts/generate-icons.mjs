// Génère les icônes PWA (192, 512, apple-touch 180) à partir du logo du site
// (src/assets/logo.jpeg), recadré en carré "cover" comme il est affiché dans l'en-tête.
// Lancer avec : npm run icons
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src', 'assets', 'logo.jpeg');
const pub = join(root, 'public');

async function icon(size, out) {
  await sharp(src)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .png()
    .toFile(join(pub, out));
}

async function run() {
  await icon(512, 'icon-512.png');
  await icon(192, 'icon-192.png');
  await icon(180, 'apple-touch-icon.png');
  console.log('Icônes générées depuis logo.jpeg : icon-512.png, icon-192.png, apple-touch-icon.png');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
