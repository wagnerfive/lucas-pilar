# Loja LP — protótipo

Astro + React + TypeScript. Páginas públicas em Astro (geradas como HTML estático, com React só nas partes interativas) e painel admin em React com shadcn/ui.

## Rodar

```bash
npm install
npm run dev      # http://localhost:2500
npm run build    # gera o site em dist/
```

## Páginas

| Rota | O que é |
|---|---|
| `/` | Início da loja |
| `/categoria/[slug]` | Categoria com filtros (`todos`, `camisas`, `bermudas`, `calcas`, `tenis`, `camisas-de-time`) |
| `/produto/[slug]` | Produto |
| `/busca?q=` | Busca |
| `/sacola`, `/checkout`, `/pedido-confirmado` | Compra |
| `/entrar`, `/meus-pedidos` | Conta do cliente |
| `/catalogo` | Catálogo com pedido pelo WhatsApp |
| `/admin/pedidos`, `/admin/produtos` | Gestão (shadcn) |

## Banco local (`src/data/`)

Os dados da demo ficam em arquivos JSON dentro do projeto. Edite e salve: o site atualiza sozinho.

| Arquivo | Conteúdo |
|---|---|
| `produtos.json` | Produtos (`"ativo": false` esconde da loja e do catálogo) |
| `pedidos.json` | Pedidos do catálogo WhatsApp que aparecem no admin |
| `pedidos-clientes.json` | Pedidos da tela "Meus pedidos" |
| `avaliacoes.json` | Avaliações da página inicial |
| `loja.json` | Desconto do Pix, frete grátis, WhatsApp, categorias, tamanhos e vitrines da home |

O formato de cada arquivo está em `src/data/schema.ts`. Se algum valor estiver errado (ex.: uma categoria que não existe), o `npm run dev`/`build` mostra o erro indicando o arquivo e o campo.

O que se faz na demo (sacola, login, pedidos novos, edições no admin) fica só no navegador de quem está usando e **não altera os arquivos**. Para voltar ao original: **Restaurar demo** no rodapé da loja/catálogo ou **Restaurar dados da demo** no menu do admin.

## Onde mexer

- `src/lib/db.ts` — leitura do banco local; `src/lib/catalog.ts` — regras e endereços das páginas.
- `src/lib/stores.ts` — estado da demo no navegador (nanostores) e `resetDemo()`.
- `src/components/store/` — peças da loja; `src/components/catalog/` — catálogo WhatsApp; `src/components/admin/` — painel.
- `src/components/ui/` — componentes shadcn (adicione mais com `npx shadcn@latest add <nome>`).
- `src/styles/global.css` — cores da marca e tema do shadcn.

## Limitações do protótipo

É uma demonstração sem backend: os dados vêm dos JSON em `src/data/` e as interações ficam no `localStorage`. O login aceita qualquer e-mail/senha, o `/admin` não tem senha e o pagamento é simulado.
