import { gsap } from 'gsap';
import { CONTATO, waLink } from '../lib/contato';

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
    // O briefing segue pelo WhatsApp, já escrito a partir dos campos.
    const cidade = String(fd.get('cidade') ?? '').trim();
    const mensagem = String(fd.get('mensagem') ?? '').trim();
    const texto = [
      `Olá! Sou ${nome} e vim pelo site da PRUMO.`,
      `Projeto: ${fd.get('tipo')}`,
      cidade && `Cidade do terreno: ${cidade}`,
      mensagem && `Sobre a casa: ${mensagem}`,
      `Meu contato: ${contato}`,
    ].filter(Boolean).join('\n');
    window.open(waLink(texto), '_blank', 'noopener');
    msg.textContent = `Abrindo o WhatsApp, ${nome.split(' ')[0]}. Se não abrir, chame no ${CONTATO.telefone}.`;
    form.reset();
  });
}
