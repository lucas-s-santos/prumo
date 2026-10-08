import { gsap } from 'gsap';

export function initBeforeAfter(reduced: boolean) {
  const el = document.querySelector<HTMLElement>('.ba');
  if (!el) return;
  const handle = el.querySelector<HTMLElement>('.ba-handle')!;
  const pos = { x: 50 };

  const set = (x: number) => {
    pos.x = Math.min(100, Math.max(0, x));
    el.style.setProperty('--x', `${pos.x}%`);
    handle.setAttribute('aria-valuenow', String(Math.round(pos.x)));
  };
  const fromX = (clientX: number) => {
    const r = el.getBoundingClientRect();
    set(((clientX - r.left) / r.width) * 100);
  };

  // Mouse arrasta na hora. No toque, só depois que o gesto se mostra horizontal:
  // um dedo rolando a página por cima da foto não pode mexer na linha. Toque parado posiciona.
  let drag: { id: number; x: number; y: number; on: boolean } | null = null;
  const start = (e: PointerEvent) => {
    drag!.on = true;
    el.setPointerCapture(e.pointerId);
    gsap.killTweensOf(pos);
    fromX(e.clientX);
  };
  el.addEventListener('pointerdown', (e) => {
    if ((e.target as Element).closest('a')) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, on: false };
    if (e.pointerType === 'mouse') start(e);
  });
  el.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.on) return fromX(e.clientX);
    const dx = Math.abs(e.clientX - drag.x), dy = Math.abs(e.clientY - drag.y);
    if (dx > 8 && dx > dy) start(e);
  });
  el.addEventListener('pointerup', (e) => {
    if (drag && !drag.on && Math.abs(e.clientX - drag.x) < 8 && Math.abs(e.clientY - drag.y) < 8) {
      gsap.killTweensOf(pos);
      fromX(e.clientX);
    }
    drag = null;
  });
  el.addEventListener('pointercancel', () => (drag = null));
  handle.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === 'ArrowLeft') set(pos.x - step);
    else if (e.key === 'ArrowRight') set(pos.x + step);
    else if (e.key === 'Home') set(0);
    else if (e.key === 'End') set(100);
    else return;
    e.preventDefault();
  });

  // Dica de interação: a linha "respira" uma vez quando a seção termina de cobrir a obra.
  if (!reduced)
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 10%', once: true }, onUpdate: () => set(pos.x) })
      .to(pos, { x: 32, duration: 0.9, ease: 'power2.inOut' })
      .to(pos, { x: 64, duration: 1.1, ease: 'power2.inOut' })
      .to(pos, { x: 50, duration: 0.8, ease: 'power2.out' });
}
