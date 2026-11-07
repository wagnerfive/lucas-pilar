import { useMemo, useState } from 'react';
import { allSizes, categories, fmt, sortProducts, url, type Category, type Product, type Sort } from '@/lib/catalog';
import { ProductCard, SizeChip, panel } from './ui';

const STEP = 10;

interface Props {
  cat: Category | 'Todos';
  products: Product[];
}

// Filtros da página de categoria (tamanho, preço, ordem). A troca de categoria é um link para outra página.
export default function CategoryBrowser({ cat, products }: Props) {
  // faixa do controle de preço = preços reais da categoria, arredondados para fora
  const prices = products.length ? products.map((p) => p.price) : [0];
  const MIN_PRICE = Math.floor(Math.min(...prices) / STEP) * STEP;
  const MAX_PRICE = Math.ceil(Math.max(...prices) / STEP) * STEP;
  const [sizes, setSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sort, setSort] = useState<Sort>('relevancia');

  const list = useMemo(() => {
    let l = products.filter((p) => p.price <= maxPrice);
    if (sizes.length) l = l.filter((p) => p.sizes.some((s) => sizes.includes(s)));
    return sortProducts(l, sort);
  }, [products, sizes, maxPrice, sort]);

  const toggle = (s: string) => setSizes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const label = 'font-mono text-[10px] uppercase tracking-[.14em] text-stone';

  return (
    <>
      <p className="mb-6 font-mono text-xs text-dim">{list.length} peças</p>
      <div className="flex flex-wrap items-start gap-7">
        <aside className={`${panel} flex max-w-full flex-[1_1_200px] flex-col gap-6 p-[18px]`}>
          <div className="flex flex-col gap-2">
            <span className={label}>Categoria</span>
            {(['Todos', ...categories] as const).map((c) => (
              <a key={c} href={url.cat(c)} className={`py-1 text-sm ${c === cat ? 'text-gold' : 'text-paper hover:text-gold-hi'}`}>
                {c}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            <span className={label}>Tamanho</span>
            <div className="flex flex-wrap gap-1.5">
              {allSizes.map((s) => (
                <SizeChip key={s} label={s} on={sizes.includes(s)} onClick={() => toggle(s)} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="preco" className={label}>Preço até</label>
            <input
              id="preco"
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={STEP}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-gold"
            />
            <span className="font-mono text-xs text-gold">{fmt(maxPrice)}</span>
          </div>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="ordem" className={label}>Ordenar</label>
            <select
              id="ordem"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-[2px] border border-line-2 bg-field p-2.5 text-[13px] text-paper"
            >
              <option value="relevancia">Relevância</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
              <option value="nome">Nome</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => { setSizes([]); setMaxPrice(MAX_PRICE); setSort('relevancia'); }}
            className="rounded-[2px] border border-line-2 p-2.5 text-xs text-stone hover:text-paper"
          >
            Limpar filtros
          </button>
        </aside>

        <div className="grid min-w-0 flex-[3_1_280px] grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-3">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
          {list.length === 0 && <p className="col-span-full py-10 text-sm text-stone">Nenhuma peça com esses filtros.</p>}
        </div>
      </div>
    </>
  );
}
