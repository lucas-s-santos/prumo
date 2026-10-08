import { gsap } from 'gsap';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

// Seção presa (global.css): o croqui se desenha da esquerda para a direita atrás de uma linha de varredura,
// as cotas se traçam, e a casa real sobe por baixo do traço como a obra — fica só um fantasma do desenho.
export function initBlueprint(reduced: boolean) {
  const section = document.querySelector<HTMLElement>('#planta');
  const svg = section?.querySelector<SVGSVGElement>('.bp');
  if (!section || !svg || reduced) return;

  const q = <T extends Element = HTMLElement>(s: string) => section.querySelector<T>(s);
  const traco = q('.bp-traco'), foto = q('.bp-foto'), scan = q('.bp-scan')!, rise = q('.bp-rise')!;
  const lines = svg.querySelectorAll<SVGPathElement>('.bp-line');
  const eixos = svg.querySelectorAll('.bp-eixo');
  const text = svg.querySelector('.bp-text');
  gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set([eixos, text], { opacity: 0 });

  function render(p: number) {
    // 1) varredura do croqui
    const a = smooth(clamp((p - 0.04) / 0.4));
    if (traco) traco.style.clipPath = `inset(0% ${(1 - a) * 100}% 0% 0%)`;
    scan.style.transform = `translateX(${a * section!.clientWidth}px)`;
    scan.style.opacity = String(a > 0 && a < 1 ? 1 : 0);
    // 2) cotas e eixos
    const c = clamp((p - 0.28) / 0.25);
    lines.forEach((l, i) => (l.style.strokeDashoffset = String(1 - clamp(c * lines.length - i))));
    gsap.set(eixos, { opacity: clamp((c - 0.4) / 0.4) });
    gsap.set(text, { opacity: clamp((c - 0.6) / 0.4) });
    // 3) a casa sobe por baixo; o croqui vira um fantasma por cima
    const b = smooth(clamp((p - 0.55) / 0.33));
    if (foto) foto.style.clipPath = `inset(${(1 - b) * 100}% 0% 0% 0%)`;
    rise.style.transform = `translateY(${-b * rise.parentElement!.clientHeight}px)`;
    rise.style.opacity = String(b > 0 && b < 1 ? 1 : 0);
    if (traco) traco.style.opacity = String(1 - 0.75 * b);
  }

  const state = { p: 0 };
  gsap.to(state, {
    p: 1,
    ease: 'none',
    scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    onUpdate: () => render(state.p),
  });
  render(0);
}
