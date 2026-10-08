# CLAUDE.md — PRUMO

Landing page de arquiteto, foco em visual impecável e scroll. Marca fictícia de portfólio (Lucas / CalmDev).

## Estrutura
- `src/pages/index.astro` — monta as seções em ordem
- `src/components/` — Nav (pílula + menu em tela cheia + fio de prumo), BuildSequence (hero + obra no scroll), BeforeAfter (tela cheia, sobe por cima da obra), Manifesto (texto 3D palavra a palavra sobre foto), Interior (sala abre de uma janela), Services (uma mídia por serviço, a próxima sobe por cima), Blueprint (Projeto: croqui gerado da foto vira a casa), Visita (galeria: aérea em tela cheia vira o 1º quadro de um trilho horizontal), Contact (casa à noite + formulário em vidro), Footer
- `src/scripts/` — `main.ts` (Lenis + GSAP, passa o Lenis ao menu), `nav.ts`, `sequence.ts` (canvas), `beforeAfter.ts`, `manifesto.ts`, `interior.ts`, `services.ts`, `blueprint.ts`, `visita.ts`, `contact.ts`
- `scripts/frames.mjs` — `npm run frames`: vídeo da obra → quadros, fotos das etapas e o croqui `projeto-traco`
- `scripts/images.mjs` — `npm run imagens`: `assets/originais-flow/{servico,contato,galeria}-*` → webp em `public/imagens` e vídeos leves em `public/videos`
- `assets/` — originais fora do deploy: `videos/obra.mp4` (fonte do hero), `originais-flow/` (fotos/vídeos gerados), `flow-entrada/` (referências para gerar), `prompts.md`; `referencias/` e `descartadas/` ficam só na máquina (fora do git)
- Repositório: https://github.com/lucas-s-santos/prumo (público, branch `main`)
- `src/lib/assets.ts` — detecta imagens/quadros em `public/` no build
- `src/styles/global.css` — tokens (`@theme`): ink, paper, amber, cedar, mute

## Regras
- Visual elegante e intencional, nada com cara de template de IA. Poucas cores: ink + amber como acento; paper só como cor de texto.
- Direção: a página toda é imagem contínua no scroll, sem seções de fundo branco.
- Efeitos inspirados em Skiper UI / React Bits / Spell / Originkit são recriados em GSAP. Não instalar React, framer-motion nem shadcn (peso no celular e um segundo motor de scroll brigando com o Lenis).
- Sem barra de rolagem nativa: o fio de prumo (`Nav.astro` + `nav.ts`) mostra a posição. Toda seção nova leva `id` + `data-nav="Nome"` (vira marca no fio e nome na pílula) e entra na lista do menu em `Nav.astro`.
- Seções presas no scroll usam `sticky` + altura em `svh` no `global.css` só com `.js:not(.reduced)` — nunca `pin` do GSAP.
- Tipografia: Instrument Sans (texto) + Instrument Serif itálico só em destaques (`.accent`).
- Todo movimento respeita `prefers-reduced-motion` (classe `.reduced` no html).
- `sequence.ts`: desktop = cover priorizando o céu; celular = faixa de 68svh, fundida ao fundo, que desliza pela fachada enquanto a obra sobe (`MOBILE_CROP` = `CROP_X/CROP_W` do `frames.mjs`). Não trocar por `<video>` (scrub engasga).
- Hero + antes/depois: `#obra` tem 500svh com o palco `sticky`; o `#comparar` tem `margin-top: -100svh` e sobe por cima da obra na última tela (`global.css`, `COVER` em `sequence.ts`). Com `.reduced`/`.no-js` tudo volta ao fluxo normal.
- Etapas seguem o vídeo, não quintos iguais: `CUTS` em `sequence.ts`. Trocou o vídeo → remarcar os cortes e os tempos das fotos em `frames.mjs`.
- `npm run frames` gera `public/frames/d` (1600px, 8 q/s), `public/frames/m` (recorte da fachada, 1100px) e as fotos `01`–`05` em `public/imagens` (modo leve e antes/depois).
- Vídeos originais ficam em `assets/`; em `public/videos` só os comprimidos pelo `npm run imagens` (vão para o deploy).
- Fotos novas: gerar na mesma casa e luz (prompts em `assets/prompts.md`), salvar em `assets/originais-flow` com prefixo `servico-`, `contato-` ou `galeria-` e rodar `npm run imagens`. A ordem da Visita está em `Visita.astro`.
- Projeto: foto, croqui e cotas alinhados pelo mesmo enquadramento (object-cover central + SVG 1920×1080 em slice). Cotas e eixos em `Blueprint.astro` estão em coordenadas da foto final.

## Pendências
- [x] Vídeo da obra (Flow) + `npm run frames`
- [x] Vídeo do hero refeito sem as marcas nos vidros (etapas remarcadas)
- [x] Manifesto, "Por dentro", menu em tela cheia e fio de prumo
- [x] Serviços, Projeto, Visita (galeria) e Contato em imagem
- [ ] Logo final em SVG (Figma) no lugar do `Logo.astro`
- [ ] Ligar o formulário (Formspree/Resend ou WhatsApp) em `contact.ts`
- [ ] Imagem OG + Lighthouse > 90 no celular
- [ ] Deploy na Vercel
