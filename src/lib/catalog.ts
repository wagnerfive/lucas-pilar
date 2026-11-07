// Dados da Loja LP, lidos do banco local (src/data/*.json).
import { db } from './db';
import type { Category, Product } from '@/data/schema';

export type { Category, Product } from '@/data/schema';

export const config = db.loja;
export const categories: Category[] = db.loja.categorias;
export const allSizes = db.loja.tamanhos;

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// produtos visíveis na loja (os marcados "ativo": false no banco ficam de fora)
export const products: Product[] = db.produtos.filter((p) => p.ativo);

export const byId = (id: number) => products.find((p) => p.id === id);

// Endereços das páginas públicas
export const url = {
  home: '/',
  cat: (c: Category | 'Todos' = 'Todos') => `/categoria/${c === 'Todos' ? 'todos' : slugify(c)}`,
  product: (p: Pick<Product, 'slug'>) => `/produto/${p.slug}`,
  search: (q: string) => `/busca?q=${encodeURIComponent(q)}`,
  bag: '/sacola',
  checkout: '/checkout',
  done: '/pedido-confirmado',
  login: '/entrar',
  orders: '/meus-pedidos',
  catalog: '/catalogo',
  admin: '/admin/pedidos',
};

// WhatsApp da loja (src/data/loja.json → whatsapp)
const phone = config.whatsapp.replace(/\D/g, '');
export const phoneLabel = `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
export const waLink = (msg: string) => `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

const brl = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmt = (n: number) => 'R$ ' + brl.format(Number(n) || 0);
export const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export function matches(p: Pick<Product, 'name' | 'cat'>, query: string) {
  const q = norm(query.trim());
  return !!q && norm(p.name + ' ' + p.cat).includes(q);
}

export type Sort = 'relevancia' | 'menor' | 'maior' | 'nome';

export function sortProducts<T extends Pick<Product, 'price' | 'name'>>(list: T[], sort: Sort): T[] {
  if (sort === 'menor') return [...list].sort((a, b) => a.price - b.price);
  if (sort === 'maior') return [...list].sort((a, b) => b.price - a.price);
  if (sort === 'nome') return [...list].sort((a, b) => a.name.localeCompare(b.name));
  return list;
}
