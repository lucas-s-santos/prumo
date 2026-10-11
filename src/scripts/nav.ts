import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Menu em tela cheia, seção atual na pílula, atalhos de teclado e o fio de prumo no lugar da barra de rolagem.
export function initNav(lenis: Lenis | null, reduced: boolean) {
  const html = document.documentElement;
  const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
  const menu = document.querySelector<HTMLElement>('#menu');
  if (!toggle || !menu) return;
  const line = document.querySelector<HTMLElement>('.menu-line')!;
  const links = [...menu.querySelectorAll<HTMLAnchorElement>('.menu-link')];
  const progs = links.map((l) => l.querySelector<HTMLElement>('.menu-prog-fill'));
  const linkSections = links.map((l) => document.querySelector<HTMLElement>(l.getAttribute('href')!));
  const base = menu.querySelector<HTMLImageElement>('.menu-base')!;
  const ripas = [...menu.querySelectorAll<HTMLElement>('.menu-ripa')];
  const ripaImgs = ripas.map((r) => r.querySelector('img')!);
  const foot = menu.querySelector<HTMLElement>('.menu-foot')!;
  const clock = menu.querySelector<HTMLElement>('.menu-clock')!;
  const now = document.querySelector<HTMLElement>('.nav-now-t');
  const sections = [...document.querySelectorAll<HTMLElement>('[data-nav]')];
  const behind = [...document.querySelectorAll<HTMLElement>('main, footer')];
  let open = false;
  let timer = 0;
  let menuTl: gsap.core.Timeline | null = null;

  // ----- Foto ao fundo: entra em ripado, tira por tira -----
  let shownSrc = '';
  let ripaTl: gsap.core.Timeline | null = null;
  const hideRipas = () => ripas.forEach((r) => (r.style.clipPath = 'inset(0% 100% 0% 0%)'));
  hideRipas();
  function showBg(i: number, instant = false) {
    const src = links[i]?.dataset.img;
    if (!src || src === shownSrc) return;
    shownSrc = src;
    ripaTl?.progress(1).kill();
    if (instant || reduced) {
      base.src = src;
      return;
    }
    ripaImgs.forEach((im) => (im.src = src));
    const st = ripas.map(() => ({ v: 0 }));
    const draw = () => ripas.forEach((r, k) => (r.style.clipPath = `inset(0% ${(1 - st[k].v) * 100}% 0% 0%)`));
    draw();
    ripaTl = gsap.timeline({
      onUpdate: draw,
      onComplete: () => {
        base.src = src;
        // Só esconde as tiras depois que a foto de baixo já pode ser pintada (sem piscar).
        base.decode().catch(() => {}).then(() => shownSrc === src && hideRipas());
      },
    }).to(st, { v: 1, duration: 0.6, ease: 'power3.inOut', stagger: 0.045 });
  }
  let warmed = false;
  const warm = () => {
    if (warmed) return;
    warmed = true;
    links.forEach((l) => { if (l.dataset.img) new Image().src = l.dataset.img; });
  };
  toggle.addEventListener('pointerenter', warm, { once: true });

  // ----- Seção atual -----
  let current = -1;
  let linkNow = -1;
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
    // A foto do fundo só carrega quando o menu abre (antes, baixava escondida na entrada da página).
  };
  // Com seções sobrepostas (o antes/depois sobe por cima da obra), vale a última ativa.
  let triggers: ScrollTrigger[] = [];
  const pick = () => {
    for (let i = triggers.length - 1; i >= 0; i--) if (triggers[i].isActive) return setCurrent(i);
  };
  triggers = sections.map((s) => ScrollTrigger.create({ trigger: s, start: 'top 50%', end: 'bottom 50%', onToggle: pick }));

  // Quanto de cada seção já passou pela tela (a linha fina sob cada item).
  const updateProgress = () => {
    const vh = innerHeight;
    links.forEach((l, i) => {
      const s = linkSections[i];
      if (!s || !progs[i]) return;
      const top = s.getBoundingClientRect().top + scrollY;
      progs[i]!.style.transform = `scaleX(${clamp((scrollY + vh - top) / s.offsetHeight)})`;
    });
  };

  // ----- Menu: abre "no prumo" -----
  const fmt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  const tick = () => (clock.textContent = fmt.format(new Date()));
  // Recorte da cortina (esquerda/direita em %) e o fio (comprimento e opacidade).
  const cur = { l: 50, r: 50, ln: 0, lo: 1 };
  const apply = () => {
    menu.style.clipPath = `inset(0% ${cur.r}% 0% ${cur.l}%)`;
    line.style.transform = `scaleY(${cur.ln})`;
    line.style.opacity = String(cur.lo);
  };

  function setOpen(v: boolean) {
    if (v === open) return;
    open = v;
    toggle!.setAttribute('aria-expanded', String(v));
    html.classList.toggle('menu-open', v);
    behind.forEach((el) => (el.inert = v));
    menuTl?.kill();
    const r = toggle!.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const xp = (x / innerWidth) * 100;
    line.style.left = `${x}px`;

    if (v) {
      warm();
      updateProgress();
      showBg(linkNow, true);
      tick();
      timer = window.setInterval(tick, 15000);
      lenis?.stop();
      if (menu!.hidden) Object.assign(cur, { l: xp, r: 100 - xp, ln: 0, lo: 1 });
      menu!.hidden = false;
      links[Math.max(0, linkNow)]?.focus({ preventScroll: true });
      if (reduced) {
        Object.assign(cur, { l: 0, r: 0, ln: 0 });
        return apply();
      }
      apply();
      menuTl = gsap.timeline()
        .to(cur, { ln: 1, lo: 1, duration: 0.4, ease: 'power3.in', onUpdate: apply })
        .to(cur, { l: 0, r: 0, duration: 0.85, ease: 'expo.inOut', onUpdate: apply })
        .to(cur, { lo: 0, duration: 0.3, onUpdate: apply }, '-=0.3')
        .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.045 }, '-=0.65')
        .fromTo(foot, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.75');
    } else {
      clearInterval(timer);
      lenis?.start();
      const done = () => { if (!open) menu!.hidden = true; };
      if (reduced) return done();
      // A cortina volta para o fio e o fio sobe.
      menuTl = gsap.timeline({ onComplete: done })
        .to(cur, { ln: 1, lo: 1, duration: 0.15, onUpdate: apply })
        .to(cur, { l: xp, r: 100 - xp, duration: 0.7, ease: 'expo.inOut', onUpdate: apply }, 0)
        .to(cur, { ln: 0, duration: 0.35, ease: 'power3.in', onUpdate: apply });
    }
  }

  toggle.addEventListener('click', () => setOpen(!open));
  // Fecha antes do clique chegar ao link, para o scroll suave (main.ts) já rodar destravado.
  menu.addEventListener('click', (e) => (e.target as Element).closest('a') && setOpen(false), true);
  links.forEach((l, i) => {
    l.addEventListener('pointerenter', () => showBg(i));
    l.addEventListener('focus', () => showBg(i));
  });
  menu.querySelector('.menu-list')!.addEventListener('pointerleave', () => showBg(linkNow));

  // Atalhos: M abre/fecha o menu, 1–8 levam à seção, Esc fecha.
  addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || html.classList.contains('lb-open')) return;
    if ((e.target as HTMLElement).closest?.('input, textarea, select, [contenteditable="true"]')) return;
    if (e.key === 'Escape' && open) {
      setOpen(false);
      toggle.focus();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      setOpen(!open);
    } else if (/^[1-9]$/.test(e.key) && links[Number(e.key) - 1]) {
      e.preventDefault();
      links[Number(e.key) - 1].click();
    }
  });

  // ----- Fio de prumo -----
  const plumb = document.querySelector<HTMLElement>('.plumb');
  if (!plumb) return pick();
  const pline = plumb.querySelector<HTMLElement>('.plumb-line')!;
  const bob = plumb.querySelector<HTMLElement>('.plumb-bob')!;
  const ticksBox = plumb.querySelector<HTMLElement>('.plumb-ticks')!;
  let h = 0, max = 1;
  const update = () => {
    const p = clamp(scrollY / max);
    pline.style.transform = `scaleY(${p})`;
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
  ScrollTrigger.addEventListener('refresh', () => { measure(); pick(); });
  measure();
  pick();
}
