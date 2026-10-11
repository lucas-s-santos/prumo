import { gsap } from 'gsap';
import type Lenis from 'lenis';

// Fotos da Visita em tela cheia: clique no quadro, setas/teclado (← → Esc) e deslizar no celular.
export function initLightbox(lenis: Lenis | null, reduced: boolean) {
  const lb = document.querySelector<HTMLElement>('.lb');
  const frames = [...document.querySelectorAll<HTMLButtonElement>('.vs-frame')];
  if (!lb || !frames.length) return;
  // Fora do <main>, para o resto da página poder ficar inerte enquanto ela está aberta.
  document.body.append(lb);
  const html = document.documentElement;
  const img = lb.querySelector<HTMLImageElement>('.lb-img')!;
  const cap = lb.querySelector<HTMLElement>('.lb-cap')!;
  const count = lb.querySelector<HTMLElement>('.lb-count')!;
  const closeBtn = lb.querySelector<HTMLButtonElement>('.lb-close')!;
  const behind = [...document.querySelectorAll<HTMLElement>('main, footer, header')];
  const fotos = frames.map((f) => {
    const card = f.closest('figure')!;
    const pic = f.querySelector('img')!;
    return { src: pic.currentSrc || pic.src, alt: pic.alt, cap: card.querySelector('figcaption')?.innerHTML ?? '' };
  });
  const total = String(fotos.length).padStart(2, '0');
  let at = 0;
  let opener: HTMLElement | null = null;

  function show(i: number, dir = 0) {
    at = (i + fotos.length) % fotos.length;
    const f = fotos[at];
    const swap = () => {
      img.src = f.src;
      img.alt = f.alt;
      cap.innerHTML = f.cap;
      count.textContent = `${String(at + 1).padStart(2, '0')} / ${total}`;
    };
    if (reduced || !dir) return swap();
    gsap.timeline()
      .to(img, { opacity: 0, x: -40 * dir, duration: 0.22, ease: 'power2.in' })
      .call(swap)
      .fromTo(img, { opacity: 0, x: 40 * dir }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' });
  }

  function open(i: number) {
    opener = frames[i];
    show(i);
    lb!.hidden = false;
    html.classList.add('lb-open');
    behind.forEach((el) => (el.inert = true));
    lenis?.stop();
    closeBtn.focus({ preventScroll: true });
    if (!reduced) {
      gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      gsap.fromTo(img, { opacity: 0, scale: 0.94, x: 0 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' });
    }
  }

  function close() {
    const done = () => {
      lb!.hidden = true;
      html.classList.remove('lb-open');
      behind.forEach((el) => (el.inert = false));
      lenis?.start();
      opener?.focus({ preventScroll: true });
    };
    if (reduced) return done();
    gsap.to(lb, { opacity: 0, duration: 0.3, onComplete: done });
  }

  frames.forEach((f, i) => f.addEventListener('click', () => open(i)));
  closeBtn.addEventListener('click', close);
  lb.querySelector('.lb-prev')!.addEventListener('click', () => show(at - 1, -1));
  lb.querySelector('.lb-next')!.addEventListener('click', () => show(at + 1, 1));
  // Clique no fundo (fora da foto e dos botões) também fecha.
  lb.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (!t.closest('button') && (t === lb || t.parentElement === lb)) close();
  });
  addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(at - 1, -1);
    else if (e.key === 'ArrowRight') show(at + 1, 1);
    else if (e.key === 'Tab') {
      // Mantém o foco dentro da foto ampliada.
      const els = [...lb.querySelectorAll<HTMLElement>('button')];
      const k = els.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      els[(k + (e.shiftKey ? -1 : 1) + els.length) % els.length].focus();
    } else return;
    e.preventDefault();
  });
  // Deslizar no celular.
  let x0 = 0;
  lb.addEventListener('pointerdown', (e) => (x0 = e.clientX));
  lb.addEventListener('pointerup', (e) => {
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
}
