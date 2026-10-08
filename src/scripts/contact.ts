import { gsap } from 'gsap';

export function initContact(reduced: boolean) {
  // A casa à noite assenta devagar enquanto a seção entra.
  const bg = document.querySelector('.ct-bg');
  if (bg && !reduced)
    gsap.fromTo(bg, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '#contato', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  const form = document.querySelector<HTMLFormElement>('.contact');
  if (!form) return;
  const msg = form.querySelector<HTMLElement>('.contact-msg')!;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const nome = String(fd.get('nome') ?? '').trim();
    const contato = String(fd.get('contato') ?? '').trim();
    if (!nome || !contato) {
      msg.textContent = 'Preencha seu nome e um contato.';
      (form.querySelector(nome ? '#f-contato' : '#f-nome') as HTMLInputElement).focus();
      return;
    }
    // TODO: enviar para um endpoint (Formspree, Resend, WhatsApp...)
    msg.textContent = `Recebido, ${nome.split(' ')[0]}. Retornamos em breve.`;
    form.reset();
  });
}
