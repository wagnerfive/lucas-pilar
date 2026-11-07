// Telas de conta do cliente: pedido confirmado, entrar e meus pedidos.
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $lastOrder, $logged, $storeOrders, flash, queueToast } from '@/lib/stores';
import { url } from '@/lib/catalog';
import { btn, field, panel } from './ui';

export function OrderDone() {
  const order = useStore($lastOrder);
  const logged = useStore($logged);

  useEffect(() => {
    if (!$lastOrder.get()) window.location.replace(url.home);
  }, []);

  if (!order) return null;
  return (
    <section className="flex max-w-[520px] flex-col items-start gap-5 py-20">
      <span className="eyebrow text-gold">Pedido confirmado</span>
      <h1 className="text-[clamp(30px,4.4vw,48px)] leading-[1.05] font-extrabold tracking-[-.01em]">
        {order.status === 'Aguardando pagamento' ? 'Pedido recebido! Falta só pagar o boleto.' : 'Valeu! Já estamos separando suas peças.'}
      </h1>
      <p className="text-[15px] leading-relaxed text-stone">
        Pedido {order.id} · {order.total} · pagamento via {order.pay ?? 'Pix'}.{' '}
        {order.status === 'Aguardando pagamento'
          ? 'O boleto vence em 3 dias úteis e o envio começa assim que o pagamento compensar.'
          : 'O código de rastreio chega por e-mail em até 24h.'}
      </p>
      {order.status === 'Aguardando pagamento' && (
        <div className={`${panel} flex w-full flex-col gap-2 p-4`}>
          <span className="font-mono text-[10px] uppercase tracking-[.14em] text-stone">Linha digitável (demonstração)</span>
          <span className="font-mono text-xs break-all text-paper">34191.79001 01043.510047 91020.150008 7 9{order.id.replace(/\D/g, '').padStart(9, '0')}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2.5">
        <a href={logged ? url.orders : url.login} className={btn.gold}>Ver meus pedidos</a>
        <a href={url.cat()} className={btn.outline}>Continuar comprando</a>
      </div>
    </section>
  );
}

export function LoginForm() {
  useEffect(() => {
    if ($logged.get()) window.location.replace(url.orders);
  }, []);

  // protótipo: qualquer e-mail/senha entra
  function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    $logged.set(true);
    queueToast('Bem-vindo de volta');
    window.location.href = url.orders;
  }

  return (
    <section className="flex justify-center py-[70px]">
      <form onSubmit={submit} className={`${panel} flex w-full max-w-[400px] flex-col gap-4 p-[30px]`}>
        <h1 className="text-[26px] font-extrabold tracking-[-.01em]">Entrar na conta</h1>
        <p className="text-sm leading-relaxed text-stone">Acompanhe pedidos, salve endereços e receba os drops antes.</p>
        <input type="email" required placeholder="E-mail" aria-label="E-mail" autoComplete="email" className={field} />
        <input type="password" required placeholder="Senha" aria-label="Senha" autoComplete="current-password" className={field} />
        <button type="submit" className="rounded-[2px] bg-gold p-4 text-[15px] font-semibold text-ink hover:bg-gold-hi">Entrar</button>
        <div className="flex justify-between text-[13px] text-dim">
          <button type="button" onClick={() => flash('Cadastro disponível na versão final. Aqui qualquer e-mail entra.')} className="hover:text-paper">Criar conta</button>
          <button type="button" onClick={() => flash('Recuperação de senha disponível na versão final')} className="hover:text-paper">Esqueci a senha</button>
        </div>
      </form>
    </section>
  );
}

export function MyOrders() {
  const orders = useStore($storeOrders);
  const logged = useStore($logged);

  useEffect(() => {
    if (!$logged.get()) window.location.replace(url.login);
  }, []);

  if (!logged) return null;
  return (
    <section className="pt-9">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-[clamp(28px,4vw,42px)] font-extrabold tracking-[-.01em]">Meus pedidos</h1>
        <button
          type="button"
          onClick={() => { $logged.set(false); window.location.href = url.home; }}
          className="rounded-[2px] border border-line-2 px-4 py-2.5 text-xs text-stone hover:text-paper"
        >
          Sair da conta
        </button>
      </div>
      <ul className="flex flex-col gap-2.5">
        {orders.map((o) => (
          <li key={o.id} className={`${panel} flex flex-wrap items-center gap-5 p-5`}>
            <div className="flex min-w-[150px] flex-col gap-1">
              <span className="font-mono text-xs text-gold">{o.id}</span>
              <span className="text-xs text-dim">{o.date}</span>
            </div>
            <span className="min-w-[120px] flex-1 text-sm text-stone">{o.items}</span>
            <span className="font-mono text-xs uppercase tracking-[.06em]" style={{ color: o.statusColor }}>{o.status}</span>
            <span className="text-base font-semibold">{o.total}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
