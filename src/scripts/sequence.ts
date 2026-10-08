import { gsap } from 'gsap';

type Data = { desktop: string[]; mobile: string[]; stages: string[]; mobileCropped: boolean };
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

// Régua do scroll da seção (0–1). A seção tem 500svh (global.css): a obra fica presa por 4 telas
// e, na última, o antes/depois sobe por cima dela — por isso COVER = 3/4.
const INTRO = 0.06, BUILD_END = 0.7, COVER = 0.75;
// Onde cada etapa começa no vídeo (0–1). Cada etapa ganha o mesmo trecho de scroll;
// dentro dela o vídeo anda no ritmo da própria obra.
const CUTS = [0, 0.12, 0.19, 0.44, 0.64, 1];
// Faixa da fachada nos quadros inteiros. Mesmos números de CROP_X/CROP_W em scripts/frames.mjs.
const MOBILE_CROP = { x: 0.11, w: 0.83 };

export function initSequence(reduced: boolean) {
  const section = document.querySelector<HTMLElement>('[data-sequence]');
  if (!section) return;
  const data: Data = JSON.parse(section.dataset.sequence!);
  const stage = section.querySelector<HTMLElement>('.seq-stage')!;
  const canvas = section.querySelector('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const poster = section.querySelector<HTMLImageElement>('.seq-poster');
  const hero = section.querySelector<HTMLElement>('.seq-hero')!;
  const hint = section.querySelector<HTMLElement>('.seq-hint')!;
  const dim = section.querySelector<HTMLElement>('.seq-dim')!;
  const labels = [...section.querySelectorAll<HTMLElement>('.seq-label')];
  const bars = [...section.querySelectorAll<HTMLElement>('.seq-bar')];
  const steps = [...section.querySelectorAll<HTMLElement>('.seq-step')];

  if (reduced) {
    hint.hidden = true;
    if (poster && data.stages.length) poster.src = data.stages[data.stages.length - 1];
    return;
  }

  // Quadros do vídeo (modo principal) ou as 5 fotos das etapas (sem quadros, ou rede lenta / economia de dados).
  const mobile = matchMedia('(max-width: 768px)').matches;
  const portrait = matchMedia('(orientation: portrait)');
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const light = !!conn && (!!conn.saveData || /2g$/.test(conn.effectiveType ?? ''));
  const frameList = mobile ? data.mobile : data.desktop;
  const useFrames = frameList.length > 1 && !light;
  const srcs = useFrames ? frameList : data.stages;
  const crop = useFrames && mobile && data.mobileCropped ? { x: 0, w: 1 } : MOBILE_CROP;
  const n = srcs.length;
  if (!n) return;

  const imgs = srcs.map(() => {
    const im = new Image();
    im.decoding = 'async';
    return im;
  });
  const ready = new Uint8Array(n);

  // Ordem de carga: primeiro e último, depois 1 a cada 8, 4, 2 e 1 quadros.
  // O scrub funciona cedo e vai ganhando detalhe enquanto o resto chega.
  const order = [...new Set([0, n - 1, ...[8, 4, 2, 1].flatMap((st) => Array.from({ length: Math.ceil(n / st) }, (_, k) => k * st))])];
  let next = 0;
  const pump = (): void => {
    const i = order[next++];
    if (i === undefined) return;
    imgs[i].src = srcs[i];
    imgs[i].decode().then(() => { ready[i] = 1; requestDraw(); }, () => {}).finally(pump);
  };
  // Primeiro quadro na hora; mais 3 filas quando a página terminar de carregar.
  pump();
  const more = () => { for (let k = 0; k < 3; k++) pump(); };
  if (document.readyState === 'complete') more();
  else addEventListener('load', more, { once: true });

  const state = { p: 0 };
  let active = -2;
  let w = 0, h = 0;
  let last = '';
  let raf = 0;
  const requestDraw = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(state.p); }); };

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (cw === w && ch === h && canvas.width === Math.round(cw * dpr)) return;
    w = cw; h = ch;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    last = '';
    draw(state.p);
  }

  function paint(im: HTMLImageElement, alpha: number, pan: number) {
    const nw = im.naturalWidth, nh = im.naturalHeight;
    ctx.globalAlpha = alpha;
    if (portrait.matches) {
      // Celular: o canvas é a faixa (global.css); ela mostra parte da fachada e desliza por ela enquanto a obra sobe.
      const sw = Math.min(nw, (w / h) * nh);
      const room = crop.w * nw - sw;
      const sx = clamp(crop.x * nw + (room > 0 ? room * pan : room / 2), 0, nw - sw);
      ctx.drawImage(im, sx, 0, sw, nh, 0, 0, w, h);
    } else {
      // Desktop: cobre a tela priorizando o céu (espaço para o título).
      const r = Math.max(w / nw, h / nh);
      const dw = nw * r, dh = nh * r;
      ctx.drawImage(im, (w - dw) / 2, (h - dh) * 0.15, dw, dh);
    }
    ctx.globalAlpha = 1;
  }

  // Progresso da etapa (0–5) — a mesma régua dos títulos e da barra.
  const stageOf = (p: number) => clamp(((p - INTRO) / (BUILD_END - INTRO)) * 5, 0, 5);
  // Etapa → tempo do vídeo (0–1).
  const videoAt = (s: number) => {
    const i = Math.min(4, Math.floor(s));
    return CUTS[i] + (CUTS[i + 1] - CUTS[i]) * (s - i);
  };

  // Quadros prontos em volta de f e o peso do segundo: funde vizinhos mesmo com a carga pela metade.
  function bracket(f: number): [number, number, number] | null {
    let a = Math.floor(f), b = Math.ceil(f);
    while (a > 0 && !ready[a]) a--;
    while (b < n - 1 && !ready[b]) b++;
    if (!ready[a] && !ready[b]) return null;
    if (!ready[a]) return [b, b, 0];
    if (!ready[b] || a === b) return [a, a, 0];
    return [a, b, (f - a) / (b - a)];
  }

  function draw(p: number) {
    if (!w) return;
    const s = stageOf(p);
    let f: number;
    if (useFrames) f = videoAt(s) * (n - 1);
    else {
      // Fotos: segura a etapa e funde para a próxima nos últimos 35%.
      const i = Math.min(Math.floor(s), n - 1);
      f = Math.min(n - 1, i + smooth(clamp((s - i - 0.65) / 0.35)));
    }
    const br = bracket(f);
    if (!br) return;
    const [a, b, t] = br;
    const pan = smooth(clamp((p - INTRO) / (BUILD_END - INTRO)));
    const key = `${a}|${b}|${t.toFixed(3)}|${pan.toFixed(4)}`;
    if (key === last) return;
    last = key;
    paint(imgs[a], 1, pan);
    if (t > 0.01) paint(imgs[b], t, pan);
    if (poster) poster.style.opacity = '0';
  }

  function ui(p: number) {
    const intro = clamp(p / (INTRO * 0.85));
    hero.style.opacity = String(1 - intro);
    hero.style.transform = `translateY(${-40 * intro}px)`;
    hint.style.opacity = String(1 - clamp(p / 0.03));

    const s = stageOf(p);
    const idx = p < INTRO ? -1 : Math.min(4, Math.floor(s));
    bars.forEach((b, i) => (b.style.transform = `scaleX(${clamp(s - i)})`));
    if (idx !== active) {
      active = idx;
      labels.forEach((l, i) =>
        gsap.to(l, { opacity: i === idx ? 1 : 0, y: i === idx ? 0 : i < idx ? -16 : 16, duration: 0.5, ease: 'power2.out', overwrite: true }),
      );
      steps.forEach((st, i) => st.classList.toggle('text-white', i <= idx));
    }

    // O antes/depois sobe por cima: a obra recua um pouco e escurece.
    const c = clamp((p - COVER) / (1 - COVER));
    dim.style.opacity = String(c * 0.6);
    stage.style.transform = c ? `translateY(${-8 * c}svh)` : '';
  }

  gsap.to(state, {
    p: 1,
    ease: 'none',
    scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    onUpdate: () => { draw(state.p); ui(state.p); },
  });

  addEventListener('resize', resize);
  portrait.addEventListener('change', resize);
  resize();
  ui(0);
}
