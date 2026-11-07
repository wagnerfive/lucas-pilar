import { useStore } from '@nanostores/react';
import { $cart, removeFromCart, setQty, totals } from '@/lib/stores';
import { config, fmt, url } from '@/lib/catalog';
import { QtyStepper, btn, panel } from './ui';

export default function BagView() {
  const cart = useStore($cart);
  const t = totals(cart);

  if (!cart.length) {
    return (
      <div className={`${panel} flex flex-col items-start gap-4 p-13`}>
        <p className="text-[15px] text-stone">Sua sacola está vazia.</p>
        <a href={url.cat()} className={btn.gold}>Começar a comprar</a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-6">
      <ul className="flex flex-col gap-2.5">
        {cart.map((i) => (
          <li key={i.key} className={`${panel} flex gap-4 p-3.5`}>
            {i.image ? (
              <img src={i.image} alt={i.name} loading="lazy" className="aspect-[3/4] w-[84px] shrink-0 rounded-[2px] object-cover" />
            ) : (
              <div className="photo aspect-[3/4] w-[84px] shrink-0" />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="text-sm leading-snug">{i.name}</span>
              <span className="font-mono text-[11px] text-dim">Tam {i.size} · {i.cat}</span>
              <div className="mt-auto flex items-center gap-3">
                <QtyStepper qty={i.qty} onDec={() => setQty(i.key, i.qty - 1)} onInc={() => setQty(i.key, i.qty + 1)} />
                <button type="button" onClick={() => removeFromCart(i.key)} className="text-xs text-dim hover:text-paper">remover</button>
              </div>
            </div>
            <span className="text-[15px] font-semibold whitespace-nowrap text-gold">{fmt(i.price * i.qty)}</span>
          </li>
        ))}
      </ul>

      <div className={`${panel} flex flex-col gap-3.5 p-[22px]`}>
        <span className="font-mono text-[10px] uppercase tracking-[.14em] text-stone">Resumo</span>
        <div className="flex justify-between text-sm"><span className="text-stone">Subtotal</span><span>{fmt(t.sub)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-stone">Frete</span><span>{t.ship === 0 ? 'grátis' : fmt(t.ship)}</span></div>
        <div className="flex justify-between border-t border-line pt-3.5 text-lg font-bold"><span>Total</span><span>{fmt(t.total)}</span></div>
        <span className="text-[13px] text-gold">{fmt(t.total * (1 - config.pixOff / 100))} pagando no Pix</span>
        <a href={url.checkout} className={`${btn.gold} py-4 text-[15px]`}>Finalizar compra</a>
      </div>
    </div>
  );
}
