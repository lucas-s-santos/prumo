# Prompts — PRUMO

Em inglês, que os modelos (Flow/Veo, Gemini, Imagen) seguem melhor.
Referências prontas em `assets/flow-entrada/`. Salve os resultados em `assets/originais-flow/` com o nome indicado.

## 1. Hero sem as marcas nas janelas

### 1a. Limpar o último quadro (edição de imagem — Gemini ou editor do Flow)
Anexe `assets/flow-entrada/fim-para-limpar.jpg`. Salve como `assets/videos/05-pronta.jpg`.

```
Edit this photo: remove the white X-shaped tape marks from all the windows so the glass is clean and clear. Keep everything else exactly the same: same house, framing, light, sky and colors. Do not add, move or restyle anything.
```

### 1b. Vídeo (Flow → Frames to Video)
Início: `assets/flow-entrada/inicio.jpg` · Fim: `assets/videos/05-pronta.jpg` (o limpo). 16:9, 1080p, maior duração disponível.
Salve como `assets/videos/obra.mp4`.

```
Static locked-off shot on a tripod: no camera movement, no zoom, no cuts. Smooth construction time-lapse of a modern two-story house on a green lawn, forested mountains and araucaria trees behind, at blue hour. Hold on the empty lawn for the first second. Then the plot is marked out and the concrete foundation slab is poured; concrete columns, beams and slabs rise floor by floor; board-formed concrete walls, large black-framed glass windows and vertical cedar slats close the volume; the scaffolding disappears, the roof garden and landscaping grow in; finally the warm interior lights turn on. Each stage takes about the same time. Keep the exact framing of the first frame. Clouds drift slowly. Photorealistic architectural photography, consistent geometry, clean clear glass. No tape or X marks on the windows, no people, no text, no watermark.
```

## 2. Imagens das seções
Anexe como referência `assets/videos/05-pronta.jpg` (a casa) e/ou `assets/flow-entrada/interior.jpg` (o interior) para manter a mesma casa e luz.

### Serviços (16:9)
`servico-projeto`
```
An architect's desk at dusk: a white and light-wood scale model of this modern house, rolled construction drawings, a pencil and a brass lamp casting warm light; through the window behind, forested mountains at blue hour. Shallow depth of field. Photorealistic editorial architectural photography, no people, no text, no watermark. 16:9.
```
`servico-obra`
```
Close-up on the construction site of this modern house: wooden formwork being removed from a board-formed concrete wall, revealing the wood-grain texture in the concrete; scaffolding and stacked cedar slats nearby; soft late-afternoon light, mountains blurred behind. Photorealistic editorial architectural photography, no people, no text, no watermark. 16:9.
```
`servico-estrutura`
```
Low-angle view from the lawn of this modern house: the cantilevered board-formed concrete slab projecting over the black-framed glass facade, thin concrete columns, sharp lines against a blue-hour sky with a few clouds, warm light inside. Photorealistic editorial architectural photography, no people, no text, no watermark. 16:9.
```
`servico-interiores`
```
The kitchen and dining area of this house: board-formed concrete island, cedar cabinetry, black pendant lights over a long wooden table, floor-to-ceiling glass with the garden lit by uplights at blue hour. Photorealistic editorial interior photography, no people, no text, no watermark. 16:9.
```

### Contato (16:9) — pode ser imagem ou vídeo em loop (câmera parada, 8 s)
`contato-noite`
```
This same modern house seen from a three-quarter angle across the lawn at night: deep blue sky with the first stars, every interior light on, warm glow through the glass and cedar slats, garden uplights on palms and araucaria trees. Calm and cinematic, with open dark sky on the left side. Photorealistic architectural photography, no people, no text, no watermark. 16:9.
```

### Galeria (8 imagens; 3:4 = vertical, 16:9 = horizontal)
`galeria-01` (3:4)
```
Detail where board-formed exposed concrete meets vertical cedar slats, raking warm light at dusk, tactile texture, minimal composition. Photorealistic editorial architectural photography, no people, no text. 3:4.
```
`galeria-02` (3:4)
```
A floating concrete staircase with cedar treads inside a double-height living room, soft blue-hour light from a tall black-framed window, warm lamps. Photorealistic editorial interior photography, no people, no text. 3:4.
```
`galeria-03` (16:9)
```
The master bedroom at blue hour: linen bed, cedar headboard wall, board-formed concrete ceiling, floor-to-ceiling glass framing forested mountains. Photorealistic editorial interior photography, no people, no text. 16:9.
```
`galeria-04` (3:4)
```
A bathroom with a natural stone wall, cedar vanity and a skylight washing the stone with soft light, a plant in the corner. Photorealistic editorial interior photography, no people, no text. 3:4.
```
`galeria-05` (16:9)
```
The roof garden of the modern house: tropical plants and a small wooden deck at the edge of the concrete slab, forested mountains behind at blue hour, warm uplights. Photorealistic editorial architectural photography, no people, no text. 16:9.
```
`galeria-06` (3:4)
```
The entrance of the house: a tall pivoting cedar door set in a natural stone wall, ferns and uplights, warm light spilling from inside at dusk. Photorealistic editorial architectural photography, no people, no text. 3:4.
```
`galeria-07` (3:4)
```
Corner of a cantilevered board-formed concrete roof slab seen from below against the blue-hour sky, warm soffit lighting, an araucaria tree in the distance. Photorealistic editorial architectural photography, no people, no text. 3:4.
```
`galeria-08` (16:9)
```
Aerial drone view at blue hour: the modern concrete, glass and cedar house glowing in a clearing of Atlantic forest, a green lawn around it, mountains in every direction. Photorealistic architectural photography, no people, no text. 16:9.
```
