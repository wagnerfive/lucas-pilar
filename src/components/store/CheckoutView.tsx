import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $cart, $catalogOrders, $lastOrder, $storeOrders, count, flash, totals, type CatalogOrder, type StoreOrder } from '@/lib/stores';
import { config, fmt, url } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import { field, panel } from './ui';

const payments = ['Pix', 'Cartão parcelado', 'Boleto', 'Carteira digital'] as const;
type Pay = (typeof payments)[number];

const notes: Record<Pay, string> = {
  Pix: `aprovação na hora · ${config.pixOff}% off`,
  'Cartão parcelado': 'até 4x sem juros',
  Boleto: 'vence em 3 dias úteis',
  'Carteira digital': 'Google Pay / Apple Pay',
};

const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// protótipo: código Pix e QR são gerados só para a demonstração
const pixCode = (id: string, total: number) =>
  `00020126580014BR.GOV.BCB.PIX0136lojalp-demo-${id.toLowerCase()}5204000053039865406${total.toFixed(2)}5802BR5907LOJA LP6009SAO PAULO6304DEMO`;

// QR de mentira, mas com cara de QR: 3 marcadores de canto + módulos pseudoaleatórios a partir do id
function PixQr({ seed }: { seed: string }) {
  const n = 25;
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => ((h = (h * 1103515245 + 12345) >>> 0) >>> 16) & 1;
  const finder = (x: number, y: number) =>
    [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const cells: string[] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && rand()) cells.push(`M${x} ${y}h1v1h-1z`);
  const eye = (x: number, y: number) => `M${x} ${y}h7v7h-7z M${x + 1} ${y + 1}v5h5v-5z M${x + 2} ${y + 2}h3v3h-3z`;
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} className="size-[200px] rounded-[2px] bg-paper" role="img" aria-label="QR Code Pix de demonstração">
      <path d={cells.join('')} fill="#0B0B0B" />
      <path d={[eye(0, 0), eye(n - 7, 0), eye(0, n - 7)].join(' ')} fill="#0B0B0B" fillRule="evenodd" />
    </svg>
  );
}

export default function CheckoutView() {
  const cart = useStore($cart);
  const [pay, setPay] = useState<Pay>('Pix');
  const [form, setForm] = useState({ nome: '', fone: '', cep: '', numero: '', endereco: '' });
  const [card, setCard] = useState({ numero: '', nome: '', validade: '', cvv: '', parcelas: '1' });
  const [pix, setPix] = useState<{ id: string; total: number } | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  const setC = (k: keyof typeof card) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setCard({ ...card, [k]: e.target.value });
  const t = totals(cart);
  const payTotal = pay === 'Pix' ? t.total * (1 - config.pixOff / 100) : t.total;

  // sem itens não há o que pagar: volta para a sacola
  useEffect(() => {
    if (!$cart.get().length) window.location.replace(url.bag);
  }, []);

  // CEP completo: busca rua, bairro e cidade no ViaCEP (se falhar, a pessoa digita)
  const [cepState, setCepState] = useState<'' | 'buscando' | 'ok' | 'erro'>('');
  const cepDigits = form.cep.replace(/\D/g, '');
  useEffect(() => {
    if (cepDigits.length !== 8) return setCepState('');
    const ctrl = new AbortController();
    setCepState('buscando');
    fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.erro) return setCepState('erro');
        const rua = [d.logradouro, d.bairro, d.localidade && `${d.localidade} - ${d.uf}`].filter(Boolean).join(', ');
        setForm((f) => ({ ...f, endereco: rua }));
        setCepState('ok');
      })
      .catch(() => !ctrl.signal.aborted && setCepState('erro'));
    return () => ctrl.abort();
  }, [cepDigits]);

  function finish(id: string) {
    const d = new Date();
    const n = count(cart);
    const boleto = pay === 'Boleto';
    const payLabel = pay === 'Cartão parcelado' ? `Cartão ${card.parcelas}x` : pay;
    const order: StoreOrder = {
      id,
      date: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
      items: `${n} ${n === 1 ? 'item' : 'itens'} · ${payLabel}`,
      status: boleto ? 'Aguardando pagamento' : 'Pagamento aprovado',
      statusColor: boleto ? '#9A948C' : '#C89A5B',
      total: fmt(payTotal),
      pay: payLabel,
    };
    // o mesmo pedido entra na lista do admin (/admin/pedidos)
    const adminOrder: CatalogOrder = {
      id,
      createdAt: d.toISOString(),
      cliente: form.nome.trim(),
      fone: form.fone.trim(),
      entrega: 'Entrega',
      endereco: `${form.endereco.trim()}, ${form.numero.trim()} · CEP ${form.cep.trim()}`,
      pagamento: payLabel,
      obs: boleto ? 'Pedido pela loja · boleto aguardando pagamento' : 'Pedido pela loja',
      items: cart.map(({ name, cat, size, qty, price }) => ({ name, cat, size, qty, price })),
      total: payTotal,
      status: 'Novo',
    };
    $storeOrders.set([order, ...$storeOrders.get()]);
    $catalogOrders.set([adminOrder, ...$catalogOrders.get()]);
    $lastOrder.set(order);
    $cart.set([]);
    window.location.href = url.done;
  }

  function placeOrder(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cart.length) return;
    if (form.fone.replace(/\D/g, '').length < 10) return flash('Informe um WhatsApp com DDD');
    if (pay === 'Cartão parcelado') {
      if (card.numero.replace(/\D/g, '').length < 13) return flash('Confira o número do cartão');
      if (!/^\d{2}\/\d{2}$/.test(card.validade.trim())) return flash('Validade no formato MM/AA');
      if (card.cvv.replace(/\D/g, '').length < 3) return flash('Confira o código de segurança');
    }
    const id = 'LP-' + Date.now().toString().slice(-6);
    if (pay === 'Pix') {
      setPix({ id, total: payTotal });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    finish(id);
  }

  async function copyPix() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pixCode(pix.id, pix.total));
      flash('Código Pix copiado');
    } catch {
      flash('Selecione o código e copie');
    }
  }

  const label = 'font-mono text-[10px] uppercase tracking-[.14em] text-stone';

  if (pix) {
    return (
      <section className={`${panel} mx-auto flex max-w-[460px] flex-col items-center gap-5 p-[clamp(20px,5vw,32px)] text-center`}>
        <span className={label}>Pagamento via Pix · pedido {pix.id}</span>
        <span className="text-3xl font-extrabold tracking-[-.01em]">{fmt(pix.total)}</span>
        <PixQr seed={pix.id} />
        <p className="max-w-[34ch] text-sm leading-relaxed text-stone">Abra o app do banco, escolha pagar com Pix e leia o QR Code ou cole o código abaixo. Expira em 30 minutos.</p>
        <div className="flex w-full flex-col gap-2">
          <input readOnly value={pixCode(pix.id, pix.total)} aria-label="Código Pix copia e cola" onFocus={(e) => e.target.select()} className={`${field} w-full font-mono text-xs`} />
          <button type="button" onClick={copyPix} className="rounded-[2px] border border-edge-2 p-3 text-sm text-paper hover:border-stone">Copiar código Pix</button>
        </div>
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.1em] text-gold">
          <span className="size-2 animate-pulse rounded-full bg-gold" />aguardando pagamento
        </span>
        <button type="button" onClick={() => finish(pix.id)} className="w-full rounded-[2px] bg-gold p-4 text-[15px] font-semibold text-ink hover:bg-gold-hi">Simular pagamento aprovado</button>
        <button type="button" onClick={() => setPix(null)} className="text-xs text-dim hover:text-paper">voltar e trocar a forma de pagamento</button>
      </section>
    );
  }

  return (
    <form onSubmit={placeOrder} className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-6">
      <div className="flex flex-col gap-6">
        <fieldset className={`${panel} flex flex-col gap-3.5 p-[22px]`}>
          <legend className={`${label} float-left mb-1`}>1 · Entrega</legend>
          <input required value={form.nome} onChange={set('nome')} placeholder="Nome completo" aria-label="Nome completo" className={field} />
          <input required value={form.fone} onChange={set('fone')} placeholder="WhatsApp (11) 99999-9999" aria-label="WhatsApp" inputMode="tel" className={field} />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
            <input required value={form.cep} onChange={set('cep')} placeholder="CEP" aria-label="CEP" inputMode="numeric" className={field} />
            <input required value={form.numero} onChange={set('numero')} placeholder="Número" aria-label="Número" className={field} />
          </div>
          <input required value={form.endereco} onChange={set('endereco')} placeholder="Rua, bairro, cidade" aria-label="Endereço" className={field} />
          {cepState && (
            <span className="text-xs text-dim">
              {cepState === 'buscando' ? 'Buscando endereço pelo CEP…' : cepState === 'ok' ? 'Endereço preenchido pelo CEP. Confira e complete se precisar.' : 'Não achamos esse CEP. Digite o endereço.'}
            </span>
          )}
        </fieldset>

        <fieldset className={`${panel} flex flex-col gap-3 p-[22px]`}>
          <legend className={`${label} float-left mb-1`}>2 · Pagamento</legend>
          {payments.map((o) => (
            <label
              key={o}
              className={cn(
                'flex cursor-pointer items-center gap-3.5 rounded-[2px] border p-4',
                pay === o ? 'border-gold bg-gold/[.08]' : 'border-line-2',
              )}
            >
              <input type="radio" name="pay" value={o} checked={pay === o} onChange={() => setPay(o)} className="sr-only" />
              <span className={cn('size-2.5 shrink-0 rounded-full', pay === o ? 'bg-gold' : 'bg-edge-2')} />
              <span className="flex-1 text-sm">{o}</span>
              <span className="font-mono text-xs text-stone">{notes[o]}</span>
            </label>
          ))}
          {pay === 'Cartão parcelado' && (
            <div className="flex flex-col gap-3 border-t border-line pt-3.5">
              <input value={card.numero} onChange={setC('numero')} placeholder="Número do cartão" aria-label="Número do cartão" inputMode="numeric" autoComplete="cc-number" className={field} />
              <input value={card.nome} onChange={setC('nome')} placeholder="Nome impresso no cartão" aria-label="Nome no cartão" autoComplete="cc-name" className={field} />
              <div className="grid grid-cols-2 gap-3">
                <input value={card.validade} onChange={setC('validade')} placeholder="Validade MM/AA" aria-label="Validade" inputMode="numeric" autoComplete="cc-exp" className={field} />
                <input value={card.cvv} onChange={setC('cvv')} placeholder="CVV" aria-label="Código de segurança" inputMode="numeric" autoComplete="cc-csc" className={field} />
              </div>
              <select value={card.parcelas} onChange={setC('parcelas')} aria-label="Parcelas" className={field}>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}x de {fmt(t.total / n)} sem juros</option>)}
              </select>
              <span className="text-xs text-dim">Protótipo: nenhum cartão é cobrado. Use números de teste.</span>
            </div>
          )}
        </fieldset>
      </div>

      <div className={`${panel} flex flex-col gap-3.5 p-[22px]`}>
        <span className={label}>Pedido</span>
        {cart.map((i) => (
          <div key={i.key} className="flex justify-between gap-3 text-[13px] text-stone">
            <span>{i.qty}× {i.name} · {i.size}</span>
            <span className="whitespace-nowrap text-paper">{fmt(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-line pt-3.5 text-sm"><span className="text-stone">Frete</span><span>{t.ship === 0 ? 'grátis' : fmt(t.ship)}</span></div>
        <div className="flex justify-between text-xl font-bold"><span>Total</span><span>{fmt(payTotal)}</span></div>
        <span className="text-xs text-dim">{notes[pay]}</span>
        <button type="submit" className="rounded-[2px] bg-gold p-4 text-[15px] font-semibold text-ink hover:bg-gold-hi">
          {pay === 'Pix' ? 'Gerar Pix' : pay === 'Boleto' ? 'Gerar boleto' : 'Pagar agora'}
        </button>
      </div>
    </form>
  );
}
