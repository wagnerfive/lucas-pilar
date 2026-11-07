// Estado compartilhado entre as ilhas React.
// Começa com os dados do banco local (src/data) e guarda as interações da demo no navegador.
// `resetDemo()` apaga essas interações e volta tudo para o que está no banco.
import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import { config } from './catalog';
import { db } from './db';
import type { CatalogOrder, OrderStatus, Product, StoreOrder } from '@/data/schema';

export type { CatalogOrder, OrderStatus, StoreOrder } from '@/data/schema';

// todas as chaves da demo começam com este prefixo
const PREFIX = 'lp.demo.';
const json = { encode: JSON.stringify, decode: JSON.parse };
const saved = <T,>(key: string, seed: T) => persistentAtom<T>(PREFIX + key, seed, json);

// ---------- Loja: sacola ----------
export interface CartItem {
  key: string;
  id: number;
  name: string;
  cat: string;
  price: number;
  size: string;
  qty: number;
  image?: string;
}

export const $cart = saved<CartItem[]>('sacola', []);

// `custom`: nome/número da camisa de time; entra no nome do item para aparecer na sacola, checkout e admin
export function addToCart(p: Pick<Product, 'id' | 'name' | 'cat' | 'price' | 'image'>, size: string, custom = '') {
  const key = `${p.id}-${size}` + (custom ? `-${custom}` : '');
  const name = custom ? `${p.name} · ${custom}` : p.name;
  const cart = $cart.get();
  $cart.set(
    cart.some((i) => i.key === key)
      ? cart.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
      : [...cart, { key, id: p.id, name, cat: p.cat, price: p.price, size, qty: 1, image: p.image }],
  );
}

export function setQty(key: string, qty: number) {
  $cart.set($cart.get().map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));
}

export function removeFromCart(key: string) {
  $cart.set($cart.get().filter((i) => i.key !== key));
}

export const count = (items: { qty: number }[]) => items.reduce((a, i) => a + i.qty, 0);

export function totals(cart: CartItem[]) {
  const sub = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const ship = sub === 0 || sub >= config.freeShip ? 0 : config.shipCost;
  return { sub, ship, total: sub + ship };
}

// ---------- Loja: conta e pedidos do cliente ----------
export const $logged = saved<boolean>('logado', false);

export const $storeOrders = saved<StoreOrder[]>('pedidos-clientes', db.pedidosClientes);

export const $lastOrder = saved<StoreOrder | null>('ultimo-pedido', null);

// ---------- Busca (compartilhada entre o cabeçalho e a página de busca) ----------
export const $query = atom('');

// ---------- Aviso rápido (toast) das páginas públicas ----------
export const $toast = atom('');
let toastTimer: ReturnType<typeof setTimeout> | undefined;

export function flash(msg: string) {
  $toast.set(msg);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $toast.set(''), 2200);
}

// aviso para mostrar na próxima página (ex.: após o login)
export function queueToast(msg: string) {
  try { sessionStorage.setItem('lp.toast', msg); } catch {}
}
export function takeQueuedToast() {
  try {
    const m = sessionStorage.getItem('lp.toast');
    sessionStorage.removeItem('lp.toast');
    return m ?? '';
  } catch {
    return '';
  }
}

// ---------- Catálogo WhatsApp + Admin ----------
export const orderStatuses: OrderStatus[] = ['Novo', 'Confirmado', 'Enviado', 'Entregue', 'Cancelado'];

// produtos editados no admin (o catálogo do WhatsApp mostra só os ativos)
export const $adminProducts = saved<Product[]>('produtos', db.produtos);
export const $catalogOrders = saved<CatalogOrder[]>('pedidos', db.pedidos);

// ---------- Demo ----------
// Volta a demo para os dados do banco local
export function resetDemo() {
  $cart.set([]);
  $logged.set(false);
  $lastOrder.set(null);
  $storeOrders.set(db.pedidosClientes);
  $adminProducts.set(db.produtos);
  $catalogOrders.set(db.pedidos);
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith(PREFIX)) localStorage.removeItem(k);
    sessionStorage.removeItem('lp.toast');
  } catch {}
}
