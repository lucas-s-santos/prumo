import { gsap } from 'gsap';

// A seção fica presa (global.css) e o scroll "levanta" cada palavra em perspectiva até ela acender.
export function initManifesto(reduced: boolean) {
  const section = document.querySelector<HTMLElement>('#manifesto');
  if (!section || reduced) return;
  const words = section.querySelectorAll('.mf-w');
  const nums = section.querySelectorAll('.mf-num');
  const bg = section.querySelector('.mf-bg');

  gsap.set(words, { opacity: 0.14, yPercent: 35, rotateX: -55, transformOrigin: '50% 100%' });
  gsap.set(nums, { opacity: 0, y: 20 });
  const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.5 } });
  if (bg) tl.fromTo(bg, { scale: 1.15 }, { scale: 1, ease: 'none', duration: 1 }, 0);
  tl.to(words, { opacity: 1, yPercent: 0, rotateX: 0, ease: 'power2.out', duration: 0.12, stagger: 0.55 / words.length }, 0.02)
    .to(nums, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.12, stagger: 0.04 }, 0.72);
}
