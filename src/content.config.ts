// Banco local: cada coleção é um arquivo JSON em src/data/, validado pelo esquema correspondente.
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { avaliacaoSchema, lojaSchema, pedidoClienteSchema, pedidoSchema, produtoSchema } from './data/schema';

export const collections = {
  produtos: defineCollection({ loader: file('src/data/produtos.json'), schema: produtoSchema }),
  pedidos: defineCollection({ loader: file('src/data/pedidos.json'), schema: pedidoSchema }),
  pedidosClientes: defineCollection({ loader: file('src/data/pedidos-clientes.json'), schema: pedidoClienteSchema }),
  avaliacoes: defineCollection({ loader: file('src/data/avaliacoes.json'), schema: avaliacaoSchema }),
  loja: defineCollection({ loader: file('src/data/loja.json'), schema: lojaSchema }),
};
