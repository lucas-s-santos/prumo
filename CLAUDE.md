# CLAUDE.md — PRUMO

Landing page de arquiteto, foco em visual impecável e scroll. Marca fictícia de portfólio (Lucas / CalmDev).

## Estrutura
- `src/pages/index.astro` — monta as seções em ordem
- `src/components/` — Intro (abertura: o prumo cai e a tela abre a partir do fio), Nav (pílula + menu em cortina + fio de prumo), Logo/Bob (pêndulo do logo em SVG), BuildSequence (hero + obra no scroll), BeforeAfter (tela cheia, sobe por cima da obra), Manifesto (texto 3D palavra a palavra sobre foto), Interior (sala abre de uma janela), Services (uma mídia por serviço, a próxima sobe por cima), Blueprint (Projeto: croqui gerado da foto vira a casa de dia), Visita (galeria: aérea em tela cheia vira o 1º quadro de um trilho horizontal), Contact (casa à noite + formulário que abre o WhatsApp), Footer (o prumo pousa na linha do chão + PRUMO gigante)
- `src/pages/404.astro` — "Esta página saiu do prumo"
- `src/lib/contato.ts` — WhatsApp, telefone, e-mail e Instagram (único lugar com os contatos)
- `src/scripts/` — `main.ts` (Lenis + GSAP, passa o Lenis ao menu), `intro.ts`, `nav.ts`, `footer.ts`, `cursor.ts`, `lightbox.ts` (fotos da Visita ampliadas), `sequence.ts` (canvas), `beforeAfter.ts`, `manifesto.ts`, `interior.ts`, `services.ts`, `blueprint.ts`, `visita.ts`, `contact.ts`
- `scripts/frames.mjs` — `npm run frames`: vídeo da obra → quadros e fotos das etapas
- `scripts/croqui.mjs` — gera o croqui `projeto-traco` das bordas da fachada de dia (`projeto-dia`) ou, sem ela, da casa pronta; roda no fim dos dois scripts
- `scripts/images.mjs` — `npm run imagens`: `assets/originais-flow/{servico,contato,galeria,projeto}-*` → webp em `public/imagens` e vídeos leves em `public/videos`
- `assets/` — originais fora do deploy: `videos/obra.mp4` (fonte do hero), `originais-flow/` (fotos/vídeos gerados), `flow-entrada/` (referências para gerar), `prompts.md`. Fora do git (só na máquina, com backup no OneDrive): `originais-flow/`, `videos/*.mp4`, `referencias/` e `descartadas/` — sem eles o site roda e faz deploy, mas `npm run frames`/`imagens` não regeneram
- Repositório: https://github.com/lucas-s-santos/prumo (público, branch `main`)
- `src/lib/assets.ts` — detecta imagens/quadros em `public/` no build
- `src/styles/global.css` — tokens (`@theme`): ink, paper, amber, cedar, mute

## Regras
- Visual elegante e intencional, nada com cara de template de IA. Poucas cores: ink + amber como acento; paper só como cor de texto.
- Direção: a página toda é imagem contínua no scroll, sem seções de fundo branco.
- Efeitos inspirados em Skiper UI / React Bits / Spell / Originkit são recriados em GSAP. Não instalar React, framer-motion nem shadcn (peso no celular e um segundo motor de scroll brigando com o Lenis).
- Sem barra de rolagem nativa: o fio de prumo (`Nav.astro` + `nav.ts`) mostra a posição. Toda seção nova leva `id` + `data-nav="Nome"` (vira marca no fio e nome na pílula) e entra na lista do menu em `Nav.astro`.
- Seções presas no scroll usam `sticky` + altura em `svh` no `global.css` só com `.js:not(.reduced)` — nunca `pin` do GSAP.
- Tipografia: Instrument Sans (texto) + Instrument Serif itálico só em destaques (`.accent`). Fontes servidas pelo próprio site (`@fontsource`, importadas no `global.css`) — não voltar ao Google Fonts.
- Menu: abre em cortina a partir do fio que cai do botão; foto do item entra em ripado (9 tiras); linha sob cada item = quanto da seção já foi vista; atalhos `M` e `1`–`8` (ordem da lista em `Nav.astro`).
- Abertura: só na 1ª visita da sessão (`sessionStorage`), nunca com movimento reduzido; `?semintro` na URL pula (para testar/medir). O estado inicial dela vem do CSS (não do JS) para não piscar.
- Cursor com contexto: qualquer elemento com `data-cursor="Texto"` mostra a pílula âmbar (só mouse).
- Desempenho: CSS embutido no HTML (`inlineStylesheets: always`), poster do hero no celular = 1º quadro recortado (`frames/m`), foto do menu só carrega ao abrir. Lighthouse celular: 92 / 100 / 100 / 100.
- Compartilhamento: `public/og.jpg` (1200×630) e `apple-touch-icon.png` foram gerados a partir da casa pronta — refazer se a casa mudar. URLs absolutas usam o domínio da Vercel (`VERCEL_PROJECT_PRODUCTION_URL` no `astro.config.mjs`).
- Todo movimento respeita `prefers-reduced-motion` (classe `.reduced` no html).
- `sequence.ts`: desktop = cover priorizando o céu; celular = faixa de 68svh, fundida ao fundo, que desliza pela fachada enquanto a obra sobe (`MOBILE_CROP` = `CROP_X/CROP_W` do `frames.mjs`). Não trocar por `<video>` (scrub engasga).
- Hero + antes/depois: `#obra` tem 500svh com o palco `sticky`; o `#comparar` tem `margin-top: -100svh` e sobe por cima da obra na última tela (`global.css`, `COVER` em `sequence.ts`). Com `.reduced`/`.no-js` tudo volta ao fluxo normal.
- Etapas seguem o vídeo, não quintos iguais: `CUTS` em `sequence.ts`. Trocou o vídeo → remarcar os cortes e os tempos das fotos em `frames.mjs`.
- `npm run frames` gera `public/frames/d` (1600px, 8 q/s), `public/frames/m` (recorte da fachada, 1100px) e as fotos `01`–`05` em `public/imagens` (modo leve e antes/depois).
- Vídeos originais ficam em `assets/`; em `public/videos` só os comprimidos pelo `npm run imagens` (vão para o deploy).
- Fotos novas: gerar na mesma casa e luz (prompts em `assets/prompts.md`), salvar em `assets/originais-flow` com prefixo `servico-`, `contato-` ou `galeria-` e rodar `npm run imagens`. A ordem da Visita está em `Visita.astro`.
- Projeto: usa `projeto-dia` (edição de dia da foto final, prompt em `assets/prompts.md`); o `npm run imagens` a escala pela largura e centraliza em 1920×1080, o encaixe medido contra a foto da noite. Foto, croqui e cotas alinhados pelo mesmo enquadramento (object-cover central + SVG 1920×1080 em slice). Cotas e eixos em `Blueprint.astro` estão em coordenadas da foto final.

## Pendências
- [x] Vídeo da obra (Flow) + `npm run frames`
- [x] Vídeo do hero refeito sem as marcas nos vidros (etapas remarcadas)
- [x] Manifesto, "Por dentro", menu em tela cheia e fio de prumo
- [x] Serviços, Projeto, Visita (galeria) e Contato em imagem
- [x] Logo em SVG redesenhado da referência (`Bob.astro` + `Logo.astro`, favicon e ícone)
- [x] Formulário envia pelo WhatsApp (`contact.ts`) e contatos reais em `src/lib/contato.ts`
- [x] Imagem OG, SEO, 404 e Lighthouse > 90 no celular
- [x] Abertura, rodapé-final, menu em cortina/ripado, cursor, fotos ampliadas, grade do Projeto e grão
- [x] Fachada de dia no Projeto (não repete a foto da noite)
- [ ] Deploy na Vercel
