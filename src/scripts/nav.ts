import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

// Menu em tela cheia, seção atual na pílula e o fio de prumo no lugar da barra de rolagem.
export function initNav(lenis: Lenis | null, reduced: boolean) {
  const html = document.documentElement;
  const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
  const menu = document.querySelector<HTMLElement>('#menu');
  if (!toggle || !menu) return;
  const links = [...menu.querySelectorAll<HTMLAnchorElement>('.menu-link')];
  const bgs = [...menu.querySelectorAll<HTMLImageElement>('.menu-bg')];
  const foot = menu.querySelector<HTMLElement>('.menu-foot')!;
  const clock = menu.querySelector<HTMLElement>('.menu-clock')!;
  const now = document.querySelector<HTMLElement>('.nav-now-t');
  const sections = [...document.querySelectorAll<HTMLElement>('[data-nav]')];
  const behind = [...document.querySelectorAll<HTMLElement>('main, footer')];

  // ----- Seção atual -----
  let current = -1;
  let linkNow = -1;
  const showBg = (i: number) => bgs.forEach((b) => b.toggleAttribute('data-on', Number(b.dataset.i) === i));
  const setCurrent = (i: number) => {
    if (i === current || !sections[i]) return;
    current = i;
    const name = sections[i].dataset.nav!;
    if (now && now.textContent !== name) {
      gsap.killTweensOf(now);
      if (reduced) now.textContent = name;
      else
        gsap.timeline()
          .to(now, { yPercent: -100, duration: 0.2, ease: 'power2.in' })
          .call(() => { now.textContent = name; })
          .fromTo(now, { yPercent: 100 }, { yPercent: 0, duration: 0.35, ease: 'power3.out' });
    }
    const href = `#${sections[i].id}`;
    linkNow = links.findIndex((l) => l.getAttribute('href') === href);
    links.forEach((l, k) => (k === linkNow ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
    showBg(linkNow);
  };
  // Com seções sobrepostas (o antes/depois sobe por cima da obra), vale a última ativa.
  let triggers: ScrollTrigger[] = [];
  const pick = () => {
    for (let i = triggers.length - 1; i >= 0; i--) if (triggers[i].isActive) return setCurrent(i);
  };
  triggers = sections.map((s) => ScrollTrigger.create({ trigger: s, start: 'top 50%', end: 'bottom 50%', onToggle: pick }));
  pick();

  // ----- Menu -----
  let open = false;
  let timer = 0;
  const fmt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  const tick = () => (clock.textContent = fmt.format(new Date()));
  const origin = () => {
    const r = toggle.getBoundingClientRect();
    return `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
  };

  function setOpen(v: boolean) {
    if (v === open) return;
    open = v;
    toggle!.setAttribute('aria-expanded', String(v));
    html.classList.toggle('menu-open', v);
    behind.forEach((el) => (el.inert = v));
    if (v) {
      bgs.forEach((b) => (b.loading = 'eager'));
      showBg(linkNow);
      menu!.hidden = false;
      lenis?.stop();
      tick();
      timer = window.setInterval(tick, 15000);
      links[Math.max(0, linkNow)]?.focus({ preventScroll: true });
      if (reduced) return;
      // Abre num círculo a partir do botão; os itens sobem de dentro das linhas.
      gsap.fromTo(menu, { clipPath: `circle(0% at ${origin()})` }, { clipPath: `circle(150% at ${origin()})`, duration: 0.9, ease: 'expo.inOut', overwrite: true });
      gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.05, delay: 0.3, overwrite: true });
      gsap.fromTo(foot, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.6, overwrite: true });
    } else {
      clearInterval(timer);
      lenis?.start();
      const done = () => { if (!open) menu!.hidden = true; };
      if (reduced) return done();
      gsap.to(menu, { clipPath: `circle(0% at ${origin()})`, duration: 0.7, ease: 'expo.inOut', overwrite: true, onComplete: done });
    }
  }

  toggle.addEventListener('click', () => setOpen(!open));
  // Fecha antes do clique chegar ao link, para o scroll suave (main.ts) já rodar destravado.
  menu.addEventListener('click', (e) => (e.target as Element).closest('a') && setOpen(false), true);
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) { setOpen(false); toggle.focus(); }
  });
  links.forEach((l, i) => {
    l.addEventListener('pointerenter', () => showBg(i));
    l.addEventListener('focus', () => showBg(i));
  });
  menu.querySelector('.menu-list')!.addEventListener('pointerleave', () => showBg(linkNow));

  // ----- Fio de prumo -----
  const plumb = document.querySelector<HTMLElement>('.plumb');
  if (!plumb) return;
  const line = plumb.querySelector<HTMLElement>('.plumb-line')!;
  const bob = plumb.querySelector<SVGElement>('.plumb-bob')!;
  const ticksBox = plumb.querySelector<HTMLElement>('.plumb-ticks')!;
  let h = 0, max = 1;
  const update = () => {
    const p = Math.min(1, Math.max(0, scrollY / max));
    line.style.transform = `scaleY(${p})`;
    bob.style.transform = `translateY(${p * h}px)`;
  };
  const measure = () => {
    h = plumb.clientHeight;
    max = Math.max(1, html.scrollHeight - innerHeight);
    // Uma marca de nível por seção, na altura em que ela começa.
    ticksBox.replaceChildren(
      ...sections.map((s) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.tabIndex = -1;
        b.className = 'plumb-tick';
        b.dataset.label = s.dataset.nav!;
        b.style.top = `${(Math.min(max, s.getBoundingClientRect().top + scrollY) / max) * 100}%`;
        b.addEventListener('click', () => (lenis ? lenis.scrollTo(s, { duration: 1.4 }) : s.scrollIntoView()));
        return b;
      }),
    );
    update();
  };
  addEventListener('scroll', update, { passive: true });
  ScrollTrigger.addEventListener('refresh', measure);
  measure();
}
