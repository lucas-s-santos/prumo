// Croqui da seção Projeto: bordas da própria foto da fachada, então o traço casa perfeitamente com ela.
// Só a área da casa fica (máscara com borda suave); linhas cor de papel sobre o fundo ink.
// Fonte: a fachada de dia (public/imagens/projeto-dia.webp) se existir, senão a casa pronta do vídeo.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function croqui() {
  const img = (n) => path.resolve('public/imagens', `${n}.webp`);
  const src = [img('projeto-dia'), img('05-pronta')].find(fs.existsSync);
  if (!src) return;
  const mask = "geq=lum='lum(X,Y)*clip(min(X-250,1760-X)/70,0,1)*clip(min(Y-240,910-Y)/70,0,1)'";
  const tint = "lutrgb=r='12+val*231/255':g='15+val*224/255':b='20+val*212/255'";
  const cmd = `ffmpeg -y -v error -i "${src}" -frames:v 1 -update 1 -vf "format=gray,gblur=sigma=1.4,edgedetect=low=0.07:high=0.18:mode=wires,${mask},format=rgb24,${tint}" -c:v libwebp -quality 82 "${img('projeto-traco')}"`;
  console.log('>', cmd);
  execSync(cmd, { stdio: 'inherit' });
}
