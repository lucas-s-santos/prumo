// Converte as fotos e vídeos novos de assets/originais-flow para o site.
// Só entram os arquivos com prefixo servico-, contato- ou galeria- (os outros são originais do hero).
// Uso: `npm run imagens` (precisa do ffmpeg no PATH).
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('assets/originais-flow');
const IMG = path.resolve('public/imagens');
const VID = path.resolve('public/videos');
const run = (cmd) => execSync(cmd, { stdio: 'inherit' });
fs.mkdirSync(VID, { recursive: true });

for (const f of fs.readdirSync(SRC)) {
  const m = f.match(/^((?:servico|contato|galeria)-[\w-]+)\.(jpe?g|png|webp|mp4)$/i);
  if (!m) continue;
  const [, name, ext] = m;
  const src = path.join(SRC, f);
  if (ext.toLowerCase() === 'mp4') {
    // Vídeo de fundo: sem áudio, 1280px, leve; o primeiro quadro vira o poster.
    run(`ffmpeg -y -v error -i "${src}" -an -vf "scale=1280:-2" -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart "${path.join(VID, `${name}.mp4`)}"`);
    run(`ffmpeg -y -v error -i "${src}" -frames:v 1 -update 1 -vf "scale=1280:-2" -c:v libwebp -quality 75 "${path.join(IMG, `${name}.webp`)}"`);
  } else {
    // Horizontal até 1920px de largura; vertical até 1400px.
    run(`ffmpeg -y -v error -i "${src}" -frames:v 1 -update 1 -vf "scale='if(gt(iw,ih),min(1920,iw),min(1400,iw))':-2" -c:v libwebp -quality 78 "${path.join(IMG, `${name}.webp`)}"`);
  }
  console.log('ok', name);
}
