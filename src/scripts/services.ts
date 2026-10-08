import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

// A seção fica presa (global.css). Cada serviço ganha um trecho igual de scroll; na virada,
// a mídia do próximo sobe por cima (recorte de baixo para cima) com um leve zoom de assentamento.
export function initServices(reduced: boolean) {
  const section = document.querySelector<HTMLElement>('#servicos');
  if (!section) return;
  const media = [...section.querySelectorAll<HTMLElement>('.sv-media')];
  const imgs = media.map((m) => m.querySelector<HTMLElement>('.sv-img'));
  const texts = [...section.querySelectorAll<HTMLElement>('.sv-text')];
  const items = [...section.querySelectorAll<HTMLElement>('.sv-li')];
  const bars = [...section.querySelectorAll<HTMLElement>('.sv-bar')];
  const vid = section.querySelector<HTMLVideoElement>('video');
  const n = media.length;

  // O vídeo só roda com a seção na tela.
  if (vid && !reduced)
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (st) => (st.isActive ? vid.play().catch(() => {}) : vid.pause()),
    });
  if (reduced || n < 2) return;

  const W = 0.07; // meia largura da virada, em fração do scroll da seção
  let active = -1;
  gsap.set(texts, { opacity: 0, y: 24 });

  function render(p: number) {
    let idx = 0;
    for (let i = 1; i < n; i++) {
      const t = clamp((p - (i / n - W)) / (2 * W));
      media[i].style.clipPath = `inset(${(1 - ease(t)) * 100}% 0% 0% 0%)`;
      if (imgs[i]) imgs[i]!.style.transform = `scale(${1.15 - 0.15 * ease(t)})`;
      if (t >= 0.5) idx = i;
    }
    bars.forEach((b, i) => (b.style.transform = `scaleX(${clamp(p * n - i)})`));
    if (idx !== active) {
      active = idx;
      texts.forEach((el, i) =>
        gsap.to(el, { opacity: i === idx ? 1 : 0, y: i === idx ? 0 : i < idx ? -24 : 24, duration: 0.6, ease: 'power3.out', overwrite: true }),
      );
      items.forEach((el, i) => el.classList.toggle('text-white', i === idx));
    }
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
