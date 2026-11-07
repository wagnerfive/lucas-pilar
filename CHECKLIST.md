# Checklist — apresentação do protótipo Loja LP

Legenda: `[x]` feito · `[ ]` pendente · `[~]` em andamento
Prioridade: **P0** sem isso a demo fica fraca · **P1** coerência e confiança · **P2** conversão · **P3** acabamento

Checklist interativo (acompanhamento): https://claude.ai/artifact/7SwGzNP8efgNydXyRUXKjt

Última atualização: 17/10/2026

---

## Já resolvido

- [x] Hero da home sem modelo feminina (foto de loja de moda masculina)
- [x] Card "Bermudas" sem short feminino (bermuda cargo)
- [x] `torcida.jpg` e `camisas-de-time.jpg` que estavam quebrados (404)
- [x] Texto "Moda masculina essencial" no subtítulo da hero e na meta description
- [x] Home em 375px rolava para os lados (hero com `min-h-[380px]`) → `min-h` só a partir de `md`

---

## P0 — Imagens dos produtos (com você)

- [ ] **Foto errada: Camisa de Time II — Amarela** (mostra chuteira em cima de bola)
- [ ] **Foto errada: Camisa Retrô 1994** (mostra um estádio; essa foto também é o banner `torcida.jpg`)

## P0 — Mobile

- [x] **Cabeçalho no celular**: logo + busca/conta/sacola numa linha e categorias numa faixa com rolagem lateral; conteúdo começa a 141px do topo em 375px
- [x] Foto da hero aparece antes do texto no celular (`order-first` até `md`)

## P0 — Fluxo de compra

- [x] **Sacola com foto** do produto (`stores.ts`, `ProductBuy.tsx`, `BagView.tsx`)
- [x] **Pedido da loja aparece no admin** (`CheckoutView.tsx` grava também em `/admin/pedidos`, com campo WhatsApp)
- [x] Textos "uniformes oficiais" / "Uniformes 26/27" / "igual à loja oficial" → "versão torcedor"

## P0 — Preparar o ambiente da demo (com você, no dia)

- [ ] Trocar o WhatsApp de exemplo `5511999998888` (`src/data/loja.json`) pelo número real ou de teste
- [ ] Apresentar pelo build (`npm run build` + `npm run preview`), sem a barra de dev do Astro
- [ ] Clicar em **Restaurar demo** antes de apresentar
- [ ] Ensaiar o roteiro completo no celular e no computador

## P1 — Coerência

- [x] Promo de tênis: "Do 39 ao 43" (bate com a grade cadastrada)
- [x] Kit básico: "3 camisas por R$ 399" com oversized preta, polo grafite e branca manga longa (economia R$ 70,70)
- [x] "ver novidades" → "ver tudo"
- [x] Personalização de nome e número nas camisas de time (campos opcionais no produto; aparece na sacola, checkout e admin)
- [x] Tabela de medidas abre modal por tipo de peça (`ProductBuy.tsx`)
- [x] "Criar conta" e "Esqueci a senha" mostram aviso de "versão final"
- [x] Pagamento simulado: Pix com QR Code + copia-e-cola + "Simular pagamento aprovado"; boleto fica "Aguardando pagamento" com linha digitável; cartão pede dados e parcelas
- [x] Datas dos pedidos de exemplo trazidas para 9–16/10 e total do LP-2418 corrigido (R$ 309,80)
- [x] Filtro de preço calculado a partir dos produtos da categoria
- [x] Tabela de pedidos do admin cabe no celular (status vai para baixo do cliente)
- [x] Fotos de produto reduzidas para 896px (11,1 MB → 2,4 MB). Originais em `_originais/images-produtos/`
- [ ] Definir o nome da marca ("Loja LP" ou "Lucas Pilar") — decisão do cliente
- [ ] Alinhar as duas promessas de entrega/pagamento (loja nacional × catálogo local) — decisão do cliente
- [ ] Não demonstrar "editar no admin e ver na loja" (o admin altera só o Catálogo WhatsApp)

## P2 — Conversão

- [x] "Você também pode gostar" (4 produtos, mesma categoria primeiro)
- [x] Aviso "Últimas N unidades" quando o estoque é 5 ou menos
- [x] Botão "Comprar pelo WhatsApp" no produto
- [x] Avaliações na página do produto (`avaliacoes.json` → campo `produto`); a home mostra as 3 primeiras
- [x] Foto ampliada em tela cheia, com setas e Esc
- [x] Endereço preenchido pelo CEP (ViaCEP) no checkout
- [~] Galeria com 4 fotos por produto: 1/48 feitas (`PROMPT-ANTIGRAVITY.md`)
- [ ] Hero com modelo masculino vestindo as peças

## P3 — Acabamento

- [x] Página 404 com a cara da loja (`src/pages/404.astro`)
- [x] Link "Gestão" removido do rodapé do catálogo público
- [x] Favicon SVG com o monograma LP (`public/favicon.svg`)
- [x] Rodapé com categorias, WhatsApp, Instagram, formas de pagamento e CNPJ de exemplo
- [x] Textos alternativos descritivos na galeria
- [~] Prévia do link (og:title/description/image prontos); falta `site: "https://dominio"` no `astro.config.mjs` quando publicar
- [ ] Trocar Instagram `@lojalp` e CNPJ de exemplo do rodapé pelos dados reais

---

## Roteiro sugerido para a apresentação (5 min)

1. Home: proposta, categorias, mais vendidos
2. Categoria "Todos" com filtro de tamanho e preço
3. Produto: foto ampliada, tabela de medidas, tamanho, Pix com desconto (na camisa de time, nome e número)
4. Sacola → checkout → Pix com QR → pedido confirmado
5. Catálogo WhatsApp: montar lista e enviar
6. Admin: pedidos da loja e do catálogo no painel, mudar status
