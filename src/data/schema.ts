// Formato dos arquivos do banco local (src/data/*.json).
// O Astro valida os JSON com estes esquemas ao rodar `npm run dev`/`build`: um campo errado vira erro na hora.
import { z } from 'astro/zod';

// Para criar uma categoria nova, inclua o nome aqui e em loja.json → categorias.
export const categoriaSchema = z.enum(['Camisas', 'Bermudas', 'Calças', 'Tênis', 'Camisas de time']);

export const produtoSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'use só letras minúsculas, números e hífen'),
  name: z.string().min(1),
  cat: categoriaSchema,
  price: z.number().positive(),
  sizes: z.array(z.string()).min(1),
  shot: z.string(), // descrição da foto (placeholder)
  image: z.string().optional(), // caminho ou URL da foto
  gallery: z.array(z.string()).optional(), // fotos extras da página do produto (costas, detalhe, look)
  desc: z.string(),
  stock: z.number().int().min(0),
  ativo: z.boolean(),
});

export const statusPedidoSchema = z.enum(['Novo', 'Confirmado', 'Enviado', 'Entregue', 'Cancelado']);

// pedido feito pelo catálogo do WhatsApp (aparece no admin)
export const pedidoSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  cliente: z.string(),
  fone: z.string(),
  entrega: z.enum(['Entrega', 'Retirada']),
  endereco: z.string(),
  pagamento: z.string(),
  obs: z.string(),
  items: z.array(z.object({ name: z.string(), cat: z.string(), size: z.string(), qty: z.number().int().positive(), price: z.number() })),
  total: z.number(),
  status: statusPedidoSchema,
});

// pedido do cliente logado na loja (tela "Meus pedidos")
export const pedidoClienteSchema = z.object({
  id: z.string(),
  date: z.string(),
  items: z.string(),
  status: z.string(),
  statusColor: z.string(),
  total: z.string(),
  pay: z.string().optional(),
});

export const avaliacaoSchema = z.object({
  id: z.string(),
  stars: z.number().int().min(1).max(5),
  text: z.string(),
  who: z.string(),
  produto: z.string().optional(), // slug do produto avaliado (aparece na página dele); a home mostra as 3 primeiras
});

export const lojaSchema = z.object({
  id: z.string(),
  pixOff: z.number().min(0).max(100),
  freeShip: z.number().min(0),
  shipCost: z.number().min(0),
  whatsapp: z.string(),
  showPricesInCatalog: z.boolean(),
  categorias: z.array(categoriaSchema),
  tamanhos: z.array(z.string()),
  vitrines: z.object({ maisVendidos: z.array(z.number()), novidades: z.array(z.number()) }),
});

export type Category = z.infer<typeof categoriaSchema>;
export type Product = z.infer<typeof produtoSchema>;
export type OrderStatus = z.infer<typeof statusPedidoSchema>;
export type CatalogOrder = z.infer<typeof pedidoSchema>;
export type StoreOrder = z.infer<typeof pedidoClienteSchema>;
export type Review = z.infer<typeof avaliacaoSchema>;
export type StoreConfig = z.infer<typeof lojaSchema>;
