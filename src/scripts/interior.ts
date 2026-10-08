import { gsap } from 'gsap';

// A janela cresce até a tela inteira; a foto faz o zoom contrário (a câmera "entra")
// e as palavras dos lados se afastam. A seção fica presa pelo global.css.
export function initInterior(reduced: boolean) {
  const section = document.querySelector<HTMLElement>('#casa');
  if (!section || reduced) return;
  const q = <T extends Element = HTMLElement>(s: string) => section.querySelector<T>(s)!;
  const mobile = matchMedia('(max-width: 768px)').matches;
  // Janela inicial (top right bottom left, em %): alta e estreita, como as esquadrias da fachada.
  const box = mobile ? { t: 30, r: 27 } : { t: 24, r: 38 };
  const out = mobile ? { l: { yPercent: -120 }, r: { yPercent: 120 } } : { l: { xPercent: -60 }, r: { xPercent: 60 } };
  // Recorte e caixilho saem dos mesmos números (o navegador encurta "inset(a b a b)" e o tween de string se perde).
  const win = q('.in-win'), frame = q('.in-frame');
  const apply = () => {
    win.style.clipPath = `inset(${box.t}% ${box.r}%)`;
    frame.style.inset = `${box.t}% ${box.r}%`;
  };
  apply();
  gsap.set(q('.in-img'), { scale: 1.45 });
  gsap.set(q('.in-cap'), { opacity: 0, y: 16 });

  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
    .to(box, { t: 0, r: 0, ease: 'power2.inOut', duration: 0.7, onUpdate: apply }, 0.1)
    .to(frame, { opacity: 0, ease: 'none', duration: 0.25 }, 0.5)
    .to(q('.in-img'), { scale: 1, ease: 'power1.out', duration: 0.8 }, 0.1)
    .to(q('.in-l'), { ...out.l, opacity: 0, ease: 'power2.in', duration: 0.45 }, 0.1)
    .to(q('.in-r'), { ...out.r, opacity: 0, ease: 'power2.in', duration: 0.45 }, 0.1)
    .to(q('.in-cap'), { opacity: 1, y: 0, ease: 'power2.out', duration: 0.15 }, 0.82);
}
