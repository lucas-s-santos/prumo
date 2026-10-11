import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// O prumo cai (como gravidade) até a ponta tocar a linha do chão; a linha se desenha do ponto de pouso
// para os lados e PRUMO sobe. O fio de prumo fixo da lateral some aqui — o daqui é o mesmo, chegando ao chão.
export function initFooter(lenis: Lenis | null, reduced: boolean) {
  const ft = document.querySelector<HTMLElement>('.ft');
  if (!ft) return;
  const html = document.documentElement;
  ft.querySelector('.ft-top')?.addEventListener('click', () =>
    lenis ? lenis.scrollTo(0, { duration: 4, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) }) : scrollTo({ top: 0 }),
  );
  ScrollTrigger.create({ trigger: ft, start: 'top 85%', onToggle: (st) => html.classList.toggle('at-end', st.isActive) });

  const fall = ft.querySelector<HTMLElement>('.ft-fall')!;
  const fio = ft.querySelector<HTMLElement>('.ft-fio')!;
  const bob = fio.nextElementSibling as SVGElement;
  const ground = ft.querySelector<HTMLElement>('.ft-ground')!;
  const word = ft.querySelector('.ft-word text');
  const ins = ft.querySelectorAll('.ft-in');

  // Comprimento do fio até a ponta encostar no chão.
  const size = () => (fio.style.height = `${fall.clientHeight - bob.getBoundingClientRect().height}px`);
  size();
  ScrollTrigger.addEventListener('refreshInit', size);
  if (reduced) return;

  const render = (p: number) => {
    const g = clamp(p / 0.6);
    fio.style.transform = `scaleY(${g * g})`;
    bob.style.transform = `translateY(${-(1 - g * g) * fio.offsetHeight}px)`;
    ground.style.transform = `scaleX(${clamp((p - 0.55) / 0.3)})`;
  };
  const state = { p: 0 };
  gsap.to(state, {
    p: 1,
    ease: 'none',
    // Termina no fim da página: o rodapé pode ser mais baixo que a tela e nunca chegar ao topo.
    scrollTrigger: { trigger: ft, start: 'top 95%', end: 'bottom bottom', scrub: 0.4 },
    onUpdate: () => render(state.p),
  });
  render(0);
  gsap.from(ins, { opacity: 0, y: 30, duration: 1, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: ground, start: 'top 80%', once: true } });
  if (word) gsap.from(word, { yPercent: 70, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: word, start: 'top 95%', once: true } });
}
