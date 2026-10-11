// Contatos usados no menu, na seção de contato, no rodapé e no envio pelo WhatsApp.
export const CONTATO = {
  whatsapp: '5535988862172',
  telefone: '(35) 98886-2172',
  email: 'lucassilvadossantos2005@gmail.com',
  instagram: 'dev.lucassilva.ss',
  cidade: 'Alfenas · Sul de Minas',
};

export const waLink = (texto?: string) =>
  `https://wa.me/${CONTATO.whatsapp}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
export const igLink = `https://instagram.com/${CONTATO.instagram}`;
export const mailLink = `mailto:${CONTATO.email}`;
