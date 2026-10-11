import { gsap } from 'gsap';

// Cursor com contexto (só mouse): sobre elementos com data-cursor="Texto", uma pílula âmbar com o texto
// acompanha o ponteiro. O cursor do sistema continua — a pílula só diz o que dá para fazer ali.
export function initCursor(reduced: boolean) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const el = document.querySelector<HTMLElement>('.cursor');
  if (!el) return;
  const label = el.querySelector<HTMLElement>('.cursor-label')!;
  const dur = reduced ? 0 : 0.35;
  const toX = gsap.quickTo(el, 'x', { duration: dur, ease: 'power3.out' });
  const toY = gsap.quickTo(el, 'y', { duration: dur, ease: 'power3.out' });
  let alvo: Element | null = null;
  let px = -1, py = -1, raf = 0;

  const set = (t: Element | null) => {
    if (t === alvo) return;
    alvo = t;
    if (t) label.textContent = t.getAttribute('data-cursor');
    el.classList.toggle('on', !!t);
  };
  // O que está sob o ponteiro muda também quando a página rola, abre um menu ou a foto ampliada
  // sem o mouse se mexer: reavalia pelo ponto onde ele parou.
  const recheck = () => {
    if (raf || px < 0) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      set(document.elementFromPoint(px, py)?.closest('[data-cursor]') ?? null);
    });
  };

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    px = e.clientX;
    py = e.clientY;
    toX(px);
    toY(py);
    set((e.target as Element).closest?.('[data-cursor]') ?? null);
  }, { passive: true });
  addEventListener('scroll', recheck, { passive: true });
  addEventListener('click', () => setTimeout(recheck, 50));
  addEventListener('keydown', () => setTimeout(recheck, 50));
  document.addEventListener('pointerleave', () => { px = -1; set(null); });
}
