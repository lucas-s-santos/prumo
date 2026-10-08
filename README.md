# PRUMO — Arquitetura & Construção

Landing page de portfólio (marca fictícia) com a casa sendo construída no scroll e comparador antes/depois.

**Stack:** Astro 7 · Tailwind 4 · GSAP ScrollTrigger · Lenis

```bash
npm install
npm run dev      # http://localhost:4321
npm run build
```

## Assets (o site detecta sozinho no build)

| Arquivo | Onde | Usado em |
|---|---|---|
| `obra.mp4` (ou clipes `A.mp4`…`D.mp4`) do Flow | `assets/videos/` | Origem de tudo abaixo → `npm run frames` |
| quadros `0001.webp`… | `public/frames/d` e `public/frames/m` | Sequência do scroll |
| `01-terreno` … `05-pronta` | `public/imagens/` | Modo leve da sequência + antes/depois (01 x 05) |
| `detalhe`, `interior` | `public/imagens/` | Manifesto e Por dentro |
| `servico-*`, `contato-*`, `galeria-*` (.jpg/.png/.mp4) | `assets/originais-flow/` | Serviços, Contato e Visita → `npm run imagens` |
| `projeto-traco` | `public/imagens/` | Croqui da seção Projeto (gerado pelo `npm run frames`) |

Sem quadros (ou com rede lenta / economia de dados), a sequência funde as fotos das etapas.
Para trocar uma foto gerada (ex.: o último quadro retocado), salve `assets/videos/05-pronta.jpg` e rode `npm run frames`.
