// Acesso ao banco local (src/data/*.json).
// Os arquivos são importados direto para funcionar tanto nas páginas quanto nas ilhas React do navegador;
// a validação acontece em src/content.config.ts, que carrega os mesmos arquivos com os esquemas.
import produtosJson from '@/data/produtos.json';
import pedidosJson from '@/data/pedidos.json';
import pedidosClientesJson from '@/data/pedidos-clientes.json';
import avaliacoesJson from '@/data/avaliacoes.json';
import lojaJson from '@/data/loja.json';
import type { CatalogOrder, Product, Review, StoreConfig, StoreOrder } from '@/data/schema';

export const db = {
  produtos: produtosJson as Product[],
  pedidos: pedidosJson as CatalogOrder[],
  pedidosClientes: pedidosClientesJson as StoreOrder[],
  avaliacoes: avaliacoesJson as Review[],
  loja: lojaJson[0] as StoreConfig,
};
