import { gsap } from 'gsap';
import type Lenis from 'lenis';

// Abertura: o prumo cai e balança até assentar, PRUMO se escreve, e a tela se abre para os lados a partir
// do fio — a mesma cortina do menu. Depois o título do hero sobe e a pílula desce.
export function initIntro(lenis: Lenis | null, reduced: boolean) {
  const html = document.documentElement;
  const intro = document.querySelector<HTMLElement>('.intro');
  if (!intro || reduced || html.classList.contains('intro-seen')) return;
  try { sessionStorage.setItem('prumo-intro', '1'); } catch {}

  html.classList.add('intro-on');
  lenis?.stop();
  const pend = intro.querySelector('.intro-pend');
  const letters = intro.querySelectorAll('.intro-word span');
  const sub = intro.querySelector('.intro-sub');
  const hero = document.querySelectorAll('.seq-hero > *');
  const pill = document.querySelector('.nav-pill');
  const cut = { v: 0 };

  // O estado inicial (prumo acima da tela, letras apagadas) já vem do global.css, para não piscar antes do script.
  gsap.set(hero, { opacity: 0, y: 40 });
  gsap.set(pill, { opacity: 0, y: -16 });
  const done = () => {
    intro.remove();
    html.classList.remove('intro-on');
    lenis?.start();
  };
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    // queda + balanço amortecido em torno do ponto de cima
    .fromTo(pend, { yPercent: -100, opacity: 1 }, { yPercent: 0, duration: 0.8, ease: 'power2.in' })
    .fromTo(pend, { rotate: 9 }, { rotate: 0, duration: 1.3, ease: 'elastic.out(1, 0.35)', transformOrigin: '50% 0%' }, 0.55)
    .fromTo(letters, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 }, 0.75)
    .fromTo(sub, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.1)
    .to([letters, sub], { opacity: 0, duration: 0.35, ease: 'power2.in' }, 1.85)
    .to(pend, { opacity: 0, duration: 0.3 }, 2)
    // a tela se abre a partir do fio; aberta, a abertura sai de cena e o scroll volta
    .to(cut, {
      v: 50,
      duration: 0.9,
      ease: 'expo.inOut',
      onUpdate: () => (intro.style.clipPath = `inset(0% ${cut.v}% 0% ${cut.v}%)`),
      onComplete: done,
    }, 1.95)
    .to(hero, { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, 2.45)
    .to(pill, { opacity: 1, y: 0, duration: 0.8 }, 2.6);
}
