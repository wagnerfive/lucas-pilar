import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $query } from '@/lib/stores';
import { matches, products } from '@/lib/catalog';
import { ProductCard } from './ui';

export default function SearchResults() {
  const query = useStore($query);

  // o termo vem da URL (?q=); depois o campo do cabeçalho atualiza $query enquanto digita
  useEffect(() => {
    $query.set(new URLSearchParams(window.location.search).get('q') ?? '');
  }, []);

  const results = products.filter((p) => matches(p, query));

  return (
    <section className="pt-9">
      <span className="eyebrow tracking-[.14em] text-stone">Busca</span>
      <h1 className="mt-2 mb-1.5 text-[clamp(26px,3.6vw,40px)] font-extrabold tracking-[-.01em]">“{query}”</h1>
      <p className="mb-6 font-mono text-xs text-dim">{results.length} resultados</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(215px,1fr))] gap-3">
        {results.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
