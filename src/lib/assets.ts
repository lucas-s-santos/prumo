// Descobre os assets em /public no build: basta soltar os arquivos que o site usa.
import fs from 'node:fs';
import path from 'node:path';

const PUBLIC = path.resolve('public');
const EXTS = ['webp', 'avif', 'jpg', 'jpeg', 'png'];

/** Procura /public/imagens/<nome>.<ext> e devolve a URL, ou null. */
export function image(name: string): string | null {
  for (const ext of EXTS) {
    if (fs.existsSync(path.join(PUBLIC, 'imagens', `${name}.${ext}`))) return `/imagens/${name}.${ext}`;
  }
  return null;
}

/** Procura /public/videos/<nome>.mp4 (gerado por `npm run imagens`) e devolve a URL, ou null. */
export function video(name: string): string | null {
  return fs.existsSync(path.join(PUBLIC, 'videos', `${name}.mp4`)) ? `/videos/${name}.mp4` : null;
}

/** Lista os quadros de /public/frames/<pasta> em ordem. */
export function frames(folder: 'd' | 'm'): string[] {
  const dir = path.join(PUBLIC, 'frames', folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => EXTS.includes(f.split('.').pop()!.toLowerCase()))
    .sort()
    .map((f) => `/frames/${folder}/${f}`);
}

export const STAGE_FILES = ['01-terreno', '02-fundacao', '03-estrutura', '04-paredes', '05-pronta'];
