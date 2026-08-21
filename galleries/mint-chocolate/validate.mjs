import { access, readFile } from 'node:fs/promises';

const required = ['index.html','styles.css','script.js','assets/mint-character.mp4','assets/main-poster.png','assets/presale-card.png','assets/identity-main.png','assets/stickers.png'];
for (const file of required) await access(new URL(file, import.meta.url));
const html = await readFile(new URL('index.html', import.meta.url), 'utf8');
for (const id of ['story','poster','figures','goods','presale','designer']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing section: ${id}`);
}
console.log('Site validation passed.');
