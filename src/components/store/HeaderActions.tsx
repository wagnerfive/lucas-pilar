import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $cart, $logged, $query, count } from '@/lib/stores';
import { url } from '@/lib/catalog';

// Busca, conta e sacola do cabeçalho. `live`: na página de busca os resultados mudam enquanto digita.
export default function HeaderActions({ live = false }: { live?: boolean }) {
  const cart = useStore($cart);
  const logged = useStore($logged);
  const query = useStore($query);
  const [value, setValue] = useState(query);

  useEffect(() => setValue(query), [query]);

  function onChange(v: string) {
    setValue(v);
    if (live) {
      $query.set(v);
      history.replaceState(null, '', url.search(v));
    }
  }

  function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = value.trim();
    if (q && !live) window.location.href = url.search(q);
  }

  return (
    <div className="ml-auto flex min-w-0 items-center gap-1.5 md:ml-0 md:gap-2">
      <form onSubmit={submit} role="search" className="flex min-w-0 items-center gap-2 rounded-[2px] border border-line-2 bg-field px-2.5 py-1.5 md:px-3 md:py-2">
        <span className="font-mono text-xs text-dim">/</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar"
          aria-label="Buscar peça"
          className="w-[72px] bg-transparent text-[13px] text-paper outline-none placeholder:text-dim sm:w-[130px]"
        />
      </form>
      <a href={logged ? url.orders : url.login} className="rounded-[2px] border border-line-2 px-2.5 py-1.5 text-[13px] whitespace-nowrap text-paper hover:border-edge-2 md:px-3.5 md:py-2">
        {logged ? 'Conta' : 'Entrar'}
      </a>
      <a href={url.bag} className="rounded-[2px] bg-gold px-2.5 py-1.5 text-[13px] font-semibold whitespace-nowrap text-ink hover:bg-gold-hi md:px-4 md:py-2">
        Sacola · {count(cart)}
      </a>
    </div>
  );
}
