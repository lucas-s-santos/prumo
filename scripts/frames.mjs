// Extrai do vídeo da obra os quadros da sequência e as fotos das etapas.
// Uso: coloque assets/videos/obra.mp4 (ou os clipes A.mp4..D.mp4) e rode `npm run frames` (precisa do ffmpeg no PATH).
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const vids = path.resolve('assets/videos');
const run = (cmd) => { console.log('>', cmd); execSync(cmd, { stdio: 'inherit' }); };

// Fonte: obra.mp4 ou, se não existir, os clipes A–D emendados.
let obra = path.join(vids, 'obra.mp4');
if (!fs.existsSync(obra)) {
  const clips = ['A', 'B', 'C', 'D'].map((c) => path.join(vids, `${c}.mp4`)).filter(fs.existsSync);
  if (!clips.length) throw new Error('Coloque assets/videos/obra.mp4 (ou A.mp4..D.mp4).');
  const list = path.join(vids, 'lista.txt');
  fs.writeFileSync(list, clips.map((c) => `file '${c.replace(/\\/g, '/')}'`).join('\n'));
  obra = path.join(vids, '_obra.mp4');
  run(`ffmpeg -y -v error -f concat -safe 0 -i "${list}" -c copy "${obra}"`);
}

// Celular: só a faixa da fachada. Mesmos números de MOBILE_CROP em src/scripts/sequence.ts.
const CROP_X = 0.11, CROP_W = 0.83;
for (const [dir, vf, q] of [
  ['d', 'fps=8,scale=1600:-2', 62],
  ['m', `fps=8,crop=iw*${CROP_W}:ih:iw*${CROP_X}:0,scale=1100:-2`, 60],
]) {
  const out = path.resolve('public/frames', dir);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  run(`ffmpeg -y -v error -i "${obra}" -vf "${vf}" -c:v libwebp -quality ${q} "${out}/%04d.webp"`);
  console.log(`${dir}: ${fs.readdirSync(out).length} quadros`);
}

// Fotos das etapas (modo leve e antes/depois), no mesmo ângulo e luz do vídeo.
// Para usar uma foto retocada (ex.: o último quadro sem as marcas nos vidros),
// salve-a como assets/videos/05-pronta.jpg|png|webp e rode de novo.
// Tempos (s) no vídeo atual; trocou o vídeo → remarcar aqui e em CUTS (src/scripts/sequence.ts).
const stills = [['01-terreno', 0], ['02-fundacao', 1.7], ['03-estrutura', 3.6], ['04-paredes', 5.6], ['05-pronta', 'fim']];
for (const [name, t] of stills) {
  const out = path.resolve('public/imagens', `${name}.webp`);
  const override = ['jpg', 'png', 'webp'].map((e) => path.join(vids, `${name}.${e}`)).find(fs.existsSync);
  const input = override ? `-i "${override}"` : t === 'fim' ? `-sseof -0.1 -i "${obra}"` : `-ss ${t} -i "${obra}"`;
  run(`ffmpeg -y -v error ${input} -frames:v 1 -update 1 -vf "scale=1920:-2" -c:v libwebp -quality 80 "${out}"`);
}

// Croqui da casa pronta (seção Projeto): bordas da própria foto, então o traço casa perfeitamente com ela.
// Só a área da casa fica (máscara com borda suave); linhas cor de papel sobre o fundo ink.
const pronta = path.resolve('public/imagens/05-pronta.webp');
const mask = "geq=lum='lum(X,Y)*clip(min(X-250,1760-X)/70,0,1)*clip(min(Y-240,910-Y)/70,0,1)'";
const tint = "lutrgb=r='12+val*231/255':g='15+val*224/255':b='20+val*212/255'";
run(`ffmpeg -y -v error -i "${pronta}" -frames:v 1 -update 1 -vf "format=gray,gblur=sigma=1.4,edgedetect=low=0.07:high=0.18:mode=wires,${mask},format=rgb24,${tint}" -c:v libwebp -quality 82 "${path.resolve('public/imagens/projeto-traco.webp')}"`);
