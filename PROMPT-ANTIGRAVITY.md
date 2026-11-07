# Tarefa: gerar as fotos que faltam na galeria dos produtos da Loja LP

Você está no projeto Astro de uma loja de moda masculina (protótipo). Cada página de produto mostra uma galeria de 4 fotos: a foto principal (`image`) + 3 fotos extras (`gallery`) definidas em `src/data/produtos.json`. Sua tarefa é **gerar as imagens que faltam, salvar nos caminhos indicados e registrar cada uma no `produtos.json`**.

## Padrão visual (obrigatório em todas as fotos)

- Mesma peça da foto de referência: mesma cor, tecido, modelagem, botões, etiquetas. **Sempre anexe a foto principal do produto como imagem de referência.**
- Fundo: parede ou piso de **concreto escuro texturizado**. Luz baixa e lateral vinda da esquerda, sombras suaves, tons dessaturados, clima de e-commerce premium de moda masculina.
- Fotorrealista. **Sem texto, sem marca d'água, sem logos reais** (nada de Nike, Adidas, clubes reais etc.).
- Fotos com pessoa ("look vestido"): homem adulto, rosto **cortado acima do queixo ou fora de quadro**, ambiente urbano escuro (muro de concreto, rua à noite). Sempre o mesmo tipo de enquadramento.
- Proporção **3:4 vertical**.

## Arquivo final

- Salvar em `public/images/produtos/<slug>-<n>.jpg` (n = 2, 3, 4).
- JPG, **896 px de largura**, qualidade ~85, até ~300 KB. Se a ferramenta gerar PNG, converta para JPG e não deixe o PNG em `public/`.
- **Não sobrescreva** nenhuma foto existente, exceto as 2 da seção "Corrigir primeiro".

## Registrar no `src/data/produtos.json`

Para cada produto, adicione (ou complete) o campo `gallery` logo após `image`, na ordem 2, 3, 4:

```json
"image": "/images/produtos/bermuda-cargo-bege.jpg",
"gallery": [
  "/images/produtos/bermuda-cargo-bege-2.jpg",
  "/images/produtos/bermuda-cargo-bege-3.jpg",
  "/images/produtos/bermuda-cargo-bege-4.jpg"
]
```

Só registre um caminho depois que o arquivo existir. Não altere nenhum outro campo nem outro arquivo de código.

---

## 1. Corrigir primeiro (fotos principais erradas)

Estas duas fotos principais não mostram o produto. Gere uma nova foto principal **sem referência** e **sobrescreva** o arquivo. Depois use a nova como referência para as fotos 2–4 delas.

| Arquivo | O que deve mostrar |
|---|---|
| `camisa-de-time-ii-amarela.jpg` | Camisa de futebol amarela (segundo uniforme), versão torcedor, **gola polo**, recortes laterais em malha perfurada, escudo fictício bordado. Pendurada em cabide de madeira num cano de ferro preto, frente. |
| `camisa-retro-1994.jpg` | Camisa de futebol retrô anos 90 em algodão, **escudo fictício em patch**, gola careca ou V com friso, visual vintage levemente desbotado. Pendurada em cabide de madeira, frente. |

## 2. Fotos extras por produto

Legenda das fotos: **2** = costas/outro ângulo · **3** = detalhe de perto · **4** = look vestido/em uso

Já existe: `camisa-oversized-preta-2.jpg` (não gerar de novo).

| Slug (referência: `public/images/produtos/<slug>.jpg`) | 2 | 3 | 4 |
|---|---|---|---|
| `camisa-oversized-preta` | ✅ feito | Detalhe da gola canelada e costura do ombro, malha pesada 240g | Homem vestindo, corte oversized solto, com calça cargo preta |
| `camisa-linho-areia` | Costas no cabide | Detalhe dos botões de madeira e textura do linho | Homem vestindo aberta ou abotoada, manga curta, calor/fim de tarde |
| `camisa-polo-pique-grafite` | Costas no cabide | Detalhe da gola e punho canelados, textura do piquê | Homem vestindo, visual arrumado-casual |
| `camisa-branca-manga-longa` | Costas no cabide | Detalhe do punho com botão e tecido tricoline | Homem vestindo, manga dobrada, com calça de alfaiataria |
| `bermuda-cargo-bege` | Costas estendida no piso de concreto | Detalhe do bolso cargo lateral com botão de pressão | Homem vestindo, comprimento no joelho, enquadrado da cintura para baixo |
| `bermuda-moletom-preta` | Costas estendida no piso de concreto | Detalhe do cordão e cós elástico, moletom flanelado | Homem vestindo, enquadrado da cintura para baixo, com tênis |
| `bermuda-jeans-escura` | Costas estendida no piso de concreto | Detalhe da barra dobrada e costuras do jeans rígido | Homem vestindo, enquadrado da cintura para baixo |
| `calca-cargo-preta` | Costas no cabide | Detalhe do bolso com velcro e ajuste no tornozelo | Homem vestindo, corte wide leg, corpo da cintura para baixo |
| `calca-jeans-reta-indigo` | Costas no cabide (bolsos traseiros) | Detalhe do botão e rebites, denim 12oz | Homem vestindo, modelagem reta, com tênis branco |
| `calca-alfaiataria-chumbo` | Costas no cabide | Detalhe das pregas frontais e cós forrado | Homem vestindo com camisa branca, caimento reto |
| `tenis-court-branco` | Vista de cima, par lado a lado sobre pedestal de concreto | Detalhe do solado de borracha vulcanizada e couro liso | Nos pés, com calça jeans, piso de concreto |
| `tenis-runner-cinza` | Vista lateral do outro lado sobre pedestal de concreto | Detalhe do mesh respirável e da entressola de espuma | Nos pés, em movimento leve, piso de concreto |
| `tenis-chunky-off-white` | Vista traseira/3/4 do par sobre bloco de concreto | Detalhe do solado alto de 4,5 cm e nobuck | Nos pés, com calça cargo preta |
| `camisa-de-time-i-listrada` | Costas com número **10** e nome fictício "LP" | Detalhe do escudo bordado | Homem vestindo, clima de torcida/arquibancada escura |
| `camisa-de-time-ii-amarela` | Costas com número **7** | Detalhe da gola polo e malha perfurada lateral | Homem vestindo, clima de torcida |
| `camisa-retro-1994` | Costas com número flocado **9** | Detalhe do escudo em patch e da gola | Homem vestindo, estilo vintage/rua |

Total: 2 fotos principais + 47 extras.

## 3. Ao terminar

1. Rode `npm run build` e confirme que não há erro (o `produtos.json` é validado pelo `src/data/schema.ts`).
2. Abra `http://localhost:2500/produto/<slug>` de alguns produtos e confira se as 4 miniaturas aparecem e trocam a foto grande.
3. No `CHECKLIST.md`, seção "P0 — Imagens dos produtos", marque o que foi feito e atualize o contador "Feitas: X/48". Marque também os itens "Foto errada: Camisa de Time II" e "Foto errada: Camisa Retrô 1994".
4. Liste no final as fotos que ficaram fracas ou diferentes da referência, para eu revisar.
