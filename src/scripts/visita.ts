import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

// Seção presa: primeiro a vista aérea sai da tela cheia e assenta no 1º quadro; depois o trilho anda
// na horizontal. A altura da seção é calculada aqui (abertura + comprimento do trilho) a cada refresh.
export function initVisita(reduced: boolean) {
  const section = document.querySelector<HTMLElement>('#visita');
  if (!section || reduced) return;
  const track = section.querySelector<HTMLElement>('.vs-track')!;
  const head = section.querySelector<HTMLElement>('.vs-head')!;
  const frames = [...section.querySelectorAll<HTMLElement>('.vs-frame')];
  const imgs = [...section.querySelectorAll<HTMLElement>('.vs-img')];
  const firstCap = section.querySelector<HTMLElement>('.vs-cap');
  const now = section.querySelector<HTMLElement>('.vs-now')!;
  const first = frames[0];
  if (!first) return;

  let vw = 0, vh = 0, open = 0, dist = 0, shown = -1;
  let centers: number[] = [], widths: number[] = [];
  const start = { x: 0, y: 0, s: 1 };

  function measure() {
    track.style.transform = '';
    first.style.transform = '';
    vw = innerWidth;
    vh = innerHeight;
    open = vh * 0.9;
    dist = Math.max(0, track.scrollWidth - vw);
    section!.style.height = `${vh + open + dist}px`;
    const top = track.getBoundingClientRect().top;
    centers = frames.map((f) => { const r = f.getBoundingClientRect(); return r.left + r.width / 2; });
    widths = frames.map((f) => f.offsetWidth);
    // De onde o 1º quadro parte: centrado e grande o bastante para cobrir a tela.
    const r = first.getBoundingClientRect();
    start.s = Math.max(vw / r.width, vh / r.height) * 1.02;
    start.x = vw / 2 - (r.left + r.width / 2);
    start.y = vh / 2 - (r.top - top + r.height / 2);
  }

  function render(p: number) {
    const y = p * (open + dist);
    // Segura a vista aérea em tela cheia no primeiro quarto da abertura, depois assenta no quadro.
    const o = smooth(clamp((y - open * 0.25) / (open * 0.75)));
    const x = -clamp(y - open, 0, dist);
    const s = start.s + (1 - start.s) * o;
    first.style.transform = `translate(${start.x * (1 - o)}px, ${start.y * (1 - o)}px) scale(${s})`;
    head.style.opacity = String(clamp((o - 0.5) / 0.5));
    if (firstCap) firstCap.style.opacity = String(clamp((o - 0.7) / 0.3));
    track.style.transform = `translateX(${x}px)`;

    // Parallax dentro de cada foto e o cômodo mais perto do centro no contador.
    let best = 0, bd = Infinity;
    centers.forEach((c, i) => {
      const cx = c + x;
      const t = clamp((cx - vw / 2) / (vw / 2 + widths[i] / 2), -1, 1);
      imgs[i].style.transform = `translateX(${-t * 7}%) scale(1.18)`;
      const d = Math.abs(cx - vw / 2);
      if (d < bd) { bd = d; best = i; }
    });
    if (o < 1) best = 0;
    if (best !== shown) {
      shown = best;
      now.textContent = String(best + 1).padStart(2, '0');
    }
  }

  const state = { p: 0 };
  measure();
  ScrollTrigger.addEventListener('refreshInit', measure);
  gsap.to(state, {
    p: 1,
    ease: 'none',
    scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
    onUpdate: () => render(state.p),
  });
  ScrollTrigger.addEventListener('refresh', () => render(state.p));
  render(0);
}
