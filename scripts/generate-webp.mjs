/* Genera una copia .webp (qualità 82) accanto a ogni .jpg nelle cartelle
   fotografiche di public/. Le foto sono servite via <picture> con fallback
   al .jpg originale: nessun path esistente cambia. Rilancia lo script dopo
   aver aggiunto nuove foto. */
import { readdir, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const DIRS = ["public/league-foto", "public/instagram", "public/cave"];

async function convertDir(dir) {
  const entries = await readdir(dir);
  const jpgs = entries.filter((f) => extname(f).toLowerCase() === ".jpg");

  for (const file of jpgs) {
    const src = join(dir, file);
    const dest = src.replace(/\.jpg$/i, ".webp");

    const [srcStat, destStat] = await Promise.all([
      stat(src),
      stat(dest).catch(() => null),
    ]);
    if (destStat && destStat.mtimeMs >= srcStat.mtimeMs) continue;

    await sharp(src).webp({ quality: 82 }).toFile(dest);
    console.log(`✓ ${dest}`);
  }
}

for (const dir of DIRS) {
  await convertDir(dir);
}
