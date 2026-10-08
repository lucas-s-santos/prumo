import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initSequence } from './sequence';
import { initBeforeAfter } from './beforeAfter';
import { initManifesto } from './manifesto';
import { initInterior } from './interior';
import { initServices } from './services';
import { initBlueprint } from './blueprint';
import { initVisita } from './visita';
import { initContact } from './contact';
import { initNav } from './nav';

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('reduced', reduced);

let lenis: Lenis | null = null;
if (!reduced) {
  const l = (lenis = new Lenis({ lerp: 0.1 }));
  l.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => l.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      if (id.length < 2) return;
      e.preventDefault();
      l.scrollTo(id === '#topo' ? 0 : id, { offset: 0, duration: 1.4 });
    }),
  );

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }),
  });
}

initSequence(reduced);
initBeforeAfter(reduced);
initManifesto(reduced);
initInterior(reduced);
initServices(reduced);
initBlueprint(reduced);
initVisita(reduced);
initContact(reduced);
initNav(lenis, reduced);
