import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $adminProducts, $catalogOrders, count, flash, type CatalogOrder } from '@/lib/stores';
import { categories, config, fmt, matches, phoneLabel, products as seed, sortProducts, waLink, type Category, type Product, type Sort } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import { Shot, SizeChip, QtyStepper, field, panel } from '@/components/store/ui';

interface Line {
  key: string;
  name: string;
  cat: string;
  price: number;
  size: string;
  qty: number;
}

const showPrices = config.showPricesInCatalog;

const price = (n: number) => (showPrices ? fmt(n) : '—');

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn('rounded-[2px] border px-4 py-2.5 text-[13px]', on ? 'border-gold bg-gold text-ink' : 'border-edge text-paper hover:border-stone')}
    >
      {children}
    </button>
  );
}

export default function WhatsAppCatalog() {
  // produtos cadastrados no admin (só os ativos); antes de hidratar usa a lista padrão
  const adminProducts = useStore($adminProducts);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const catalog: Product[] = useMemo(() => {
    const active = adminProducts.filter((p) => p.ativo !== false);
    return hydrated && active.length ? active : seed;
  }, [adminProducts, hydrated]);

  const [cat, setCat] = useState<Category | 'Todos'>('Todos');
  const [sort, setSort] = useState<Sort>('relevancia');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Record<number, string>>({});
  const [order, setOrder] = useState<Line[]>([]);
  const [note, setNote] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ nome: '', fone: '', entrega: 'Entrega' as CatalogOrder['entrega'], endereco: '', pagamento: 'Pix' });

  const searching = query.trim() !== '';
  const list = sortProducts(searching ? catalog.filter((p) => matches(p, query)) : catalog.filter((p) => cat === 'Todos' || p.cat === cat), sort);
  const total = order.reduce((a, i) => a + i.price * i.qty, 0);

  useEffect(() => {
    if (!formOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFormOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [formOpen]);

  function add(p: Product) {
    const size = picked[p.id];
    if (!size) return flash(`Escolha o tamanho de ${p.name}`);
    const key = `${p.id}-${size}`;
    setOrder((o) =>
      o.some((i) => i.key === key)
        ? o.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
        : [...o, { key, name: p.name, cat: p.cat, price: p.price, size, qty: 1 }],
    );
    flash(`${p.name} (${size}) no pedido`);
  }

  const bump = (key: string, d: number) => setOrder((o) => o.map((i) => (i.key === key ? { ...i, qty: Math.max(1, i.qty + d) } : i)));
  const lineText = (i: Line) => `• ${i.qty}x ${i.name} (tam ${i.size})` + (showPrices ? ` — ${fmt(i.price * i.qty)}` : '');

  function message() {
    let msg = 'Olá! Vi o catálogo da Loja LP e quero pedir:\n' + order.map(lineText).join('\n');
    if (showPrices) msg += `\n\nTotal: ${fmt(total)}`;
    if (note.trim()) msg += `\n\nObs: ${note.trim()}`;
    return msg;
  }

  function submitOrder(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.nome.trim() || form.fone.replace(/\D/g, '').length < 10) return flash('Preencha nome e WhatsApp');
    if (form.entrega === 'Entrega' && !form.endereco.trim()) return flash('Informe o endereço de entrega');
    const o: CatalogOrder = {
      id: 'LP-' + Date.now().toString().slice(-6),
      createdAt: new Date().toISOString(),
      cliente: form.nome.trim(),
      fone: form.fone.trim(),
      entrega: form.entrega,
      endereco: form.entrega === 'Entrega' ? form.endereco.trim() : '',
      pagamento: form.pagamento,
      obs: note.trim(),
      items: order.map(({ name, cat, size, qty, price }) => ({ name, cat, size, qty, price })),
      total,
      status: 'Novo',
    };
    $catalogOrders.set([o, ...$catalogOrders.get()]);
    const msg =
      `Olá! Pedido ${o.id} pelo catálogo da Loja LP.\n\n` +
      order.map(lineText).join('\n') +
      (showPrices ? `\n\nTotal: ${fmt(total)}` : '') +
      `\n\nNome: ${o.cliente}\nWhatsApp: ${o.fone}\n${o.entrega}${o.endereco ? ': ' + o.endereco : ''}\nPagamento: ${o.pagamento}` +
      (o.obs ? `\nObs: ${o.obs}` : '');
    window.open(waLink(msg), '_blank');
    setOrder([]);
    setNote('');
    setPicked({});
    setFormOpen(false);
    flash(`Pedido ${o.id} salvo e enviado`);
  }

  function scrollToOrder() {
    const el = document.getElementById('pedido');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  }

  const label = 'font-mono text-[10px] uppercase tracking-[.14em] text-stone';

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-[18px] px-5 py-3.5">
          <a href="/catalogo" className="flex shrink-0 items-center gap-2.5">
            <img src="/logo.jpg" alt="LP" width={38} height={38} className="block size-[38px] rounded-[2px]" />
            <span className="font-mono text-[11px] uppercase tracking-[.22em] text-stone">Catálogo LP</span>
          </a>
          <div className="flex min-w-0 flex-[1_1_180px] items-center gap-2 rounded-[2px] border border-line-2 bg-field px-3 py-2.5">
            <span className="font-mono text-xs text-dim">/</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar no catálogo"
              aria-label="Buscar no catálogo"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-paper outline-none placeholder:text-dim"
            />
          </div>
          <button type="button" onClick={scrollToOrder} className="rounded-[2px] bg-wa px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap text-wa-ink">
            Meu pedido · {count(order)}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-5">
        <section className="flex max-w-[660px] flex-col gap-4 pt-9 pb-7">
          <span className="eyebrow text-gold">Coleção 2026</span>
          <h1 className="text-[clamp(30px,4.6vw,54px)] leading-none font-extrabold tracking-[-.02em] text-pretty">Escolha as peças, feche no WhatsApp.</h1>
          <p className="text-base leading-relaxed text-stone">
            Camisas, bermudas, calças, tênis e camisas de time. Monte sua lista aqui e envie pro atendimento: a gente confirma tamanho, frete e pagamento na conversa.
          </p>
          <div className="flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-[.06em] text-dim">
            <span>Pix, cartão ou dinheiro</span>
            <span>Entrega na cidade em 24h</span>
            <span>Retirada combinada</span>
          </div>
        </section>

        <section className="flex flex-wrap gap-2 border-b border-line pb-[22px]">
          {(['Todos', ...categories] as const).map((c) => (
            <Chip key={c} on={cat === c && !searching} onClick={() => { setCat(c); setQuery(''); }}>{c}</Chip>
          ))}
        </section>

        <section className="flex flex-wrap items-start gap-7 pt-6">
          <div className="min-w-0 flex-[3_1_300px]">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3.5">
              <h2 className="eyebrow text-[13px] text-stone">{searching ? 'Resultados' : cat} · {list.length} peças</h2>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                aria-label="Ordenar"
                className="rounded-[2px] border border-line-2 bg-field px-3 py-2 text-xs text-paper"
              >
                <option value="relevancia">Ordenar: destaque</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
                <option value="nome">Nome</option>
              </select>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
              {list.map((p) => (
                <div key={p.id} className="flex flex-col border border-line-2 bg-tile">
                  <Shot src={p.image} alt={p.name} label={p.shot} className="aspect-[3/4]" />
                  <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                    <span className="font-mono text-[10px] uppercase tracking-[.1em] text-dim">{p.cat}</span>
                    <span className="text-sm leading-snug">{p.name}</span>
                    <span className="text-[15px] font-semibold text-gold">{showPrices ? fmt(p.price) : 'Preço no WhatsApp'}</span>
                    <span className="mt-1 font-mono text-[10px] uppercase tracking-[.1em] text-dim">Tamanho</span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.sizes.map((s) => (
                        <SizeChip key={s} label={s} on={picked[p.id] === s} onClick={() => setPicked((x) => ({ ...x, [p.id]: s }))} className="min-w-[38px] py-1.5 text-xs" />
                      ))}
                    </div>
                    <button type="button" onClick={() => add(p)} className="mt-auto rounded-[2px] border border-edge-2 p-2.5 text-[13px] text-paper hover:border-stone">
                      {picked[p.id] ? `Adicionar tam ${picked[p.id]}` : 'Adicionar ao pedido'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside id="pedido" className={`${panel} sticky top-[90px] flex max-w-full flex-[1_1_260px] flex-col gap-3.5 p-5`}>
            <span className={label}>Meu pedido</span>
            {order.length === 0 ? (
              <p className="text-sm leading-relaxed text-dim">Nenhuma peça ainda. Escolha o tamanho e toque em adicionar — a lista vira a mensagem do WhatsApp.</p>
            ) : (
              <>
                <ul className="flex flex-col gap-3">
                  {order.map((i) => (
                    <li key={i.key} className="flex flex-col gap-2 border-b border-[#1B1918] pb-3">
                      <div className="flex justify-between gap-2.5">
                        <span className="text-[13px] leading-snug">{i.name}</span>
                        <span className="text-[13px] font-semibold whitespace-nowrap text-gold">{price(i.price * i.qty)}</span>
                      </div>
                      <span className="font-mono text-[11px] text-dim">Tam {i.size}</span>
                      <div className="flex items-center gap-3">
                        <QtyStepper qty={i.qty} onDec={() => bump(i.key, -1)} onInc={() => bump(i.key, 1)} />
                        <button type="button" onClick={() => setOrder((o) => o.filter((x) => x.key !== i.key))} className="text-xs text-dim hover:text-paper">remover</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between text-base font-bold"><span>Total</span><span>{showPrices ? fmt(total) : 'a combinar'}</span></div>
                <span className="text-xs leading-normal text-dim">Frete e forma de pagamento combinados na conversa.</span>
                <label className="flex flex-col gap-2">
                  <span className={label}>Recado (opcional)</span>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="ex: quero retirar hoje à tarde" className={`${field} resize-y text-[13px]`} />
                </label>
                <button type="button" onClick={() => setFormOpen(true)} className="rounded-[2px] bg-wa p-4 text-sm font-semibold text-wa-ink">Enviar pedido no WhatsApp</button>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard?.writeText(message()); flash('Mensagem copiada'); }}
                  className="rounded-[2px] border border-line-2 p-2.5 text-xs text-stone hover:text-paper"
                >
                  Copiar mensagem
                </button>
                <button type="button" onClick={() => { setOrder([]); setNote(''); }} className="p-0.5 text-xs text-faint hover:text-stone">limpar lista</button>
              </>
            )}
            <div className="flex flex-col gap-1.5 border-t border-[#1B1918] pt-3.5">
              <span className="font-mono text-[11px] text-dim">Atendimento</span>
              <span className="text-[13px] text-stone">{phoneLabel} · seg a sáb, 9h–19h</span>
            </div>
          </aside>
        </section>
      </main>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-[rgba(6,6,6,.78)] p-6" onClick={(e) => e.target === e.currentTarget && setFormOpen(false)}>
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="finalizar"
            onSubmit={submitOrder}
            className={`${panel} flex w-full max-w-[460px] animate-lp-up flex-col gap-4 border-line-2 p-[26px]`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[.16em] text-gold">Finalizar pedido</span>
                <span id="finalizar" className="text-xl font-extrabold tracking-[-.01em]">{count(order)} peças · {showPrices ? fmt(total) : 'a combinar'}</span>
              </div>
              <button type="button" onClick={() => setFormOpen(false)} aria-label="Fechar" className="text-xl leading-none text-dim hover:text-paper">×</button>
            </div>
            <label className="flex flex-col gap-2">
              <span className={label}>Seu nome</span>
              <input autoFocus value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome e sobrenome" className={field} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={label}>WhatsApp</span>
              <input value={form.fone} onChange={(e) => setForm({ ...form, fone: e.target.value })} placeholder="(11) 99999-9999" inputMode="tel" className={field} />
            </label>
            <div className="flex flex-col gap-2">
              <span className={label}>Como receber</span>
              <div className="flex flex-wrap gap-2">
                {(['Entrega', 'Retirada'] as const).map((o) => (
                  <Chip key={o} on={form.entrega === o} onClick={() => setForm({ ...form, entrega: o })}>{o}</Chip>
                ))}
              </div>
            </div>
            {form.entrega === 'Entrega' && (
              <label className="flex flex-col gap-2">
                <span className={label}>Endereço</span>
                <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número, bairro, cidade" className={field} />
              </label>
            )}
            <div className="flex flex-col gap-2">
              <span className={label}>Pagamento</span>
              <div className="flex flex-wrap gap-2">
                {['Pix', 'Cartão', 'Dinheiro'].map((o) => (
                  <Chip key={o} on={form.pagamento === o} onClick={() => setForm({ ...form, pagamento: o })}>{o}</Chip>
                ))}
              </div>
            </div>
            <button type="submit" className="rounded-[2px] bg-wa p-4 text-[15px] font-semibold text-wa-ink">Salvar e abrir WhatsApp</button>
            <span className="text-xs leading-normal text-dim">O pedido é registrado na gestão da loja e a conversa abre com tudo preenchido.</span>
          </form>
        </div>
      )}
    </>
  );
}
