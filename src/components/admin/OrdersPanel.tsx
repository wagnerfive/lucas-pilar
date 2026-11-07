import { Fragment, useState } from 'react';
import { useStore } from '@nanostores/react';
import { ChevronDown, MessageCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { $catalogOrders, orderStatuses, type CatalogOrder, type OrderStatus } from '@/lib/stores';
import { fmt, url } from '@/lib/catalog';
import { cn } from '@/lib/utils';

export const statusStyle: Record<OrderStatus, string> = {
  Novo: 'bg-[#C89A5B]/15 text-[#C89A5B]',
  Confirmado: 'bg-[#8FB3D9]/15 text-[#8FB3D9]',
  Enviado: 'bg-[#B79CD9]/15 text-[#B79CD9]',
  Entregue: 'bg-[#8CBE79]/15 text-[#8CBE79]',
  Cancelado: 'bg-[#C98080]/15 text-[#C98080]',
};

type Filter = OrderStatus | 'Todos';

function waReply(o: CatalogOrder) {
  const digits = o.fone.replace(/\D/g, '');
  const wa = digits.length > 10 ? digits : '55' + digits;
  return `https://wa.me/${wa}?text=${encodeURIComponent(`Olá ${o.cliente.split(' ')[0]}! Sobre seu pedido ${o.id}: `)}`;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function OrdersPanel() {
  const orders = useStore($catalogOrders);
  const [filter, setFilter] = useState<Filter>('Todos');
  const [openId, setOpenId] = useState<string | null>(null);

  const valid = orders.filter((o) => o.status !== 'Cancelado');
  const revenue = valid.reduce((a, o) => a + (o.total || 0), 0);
  const metrics = [
    { label: 'Pedidos', value: String(orders.length) },
    { label: 'Novos', value: String(orders.filter((o) => o.status === 'Novo').length) },
    { label: 'Receita', value: fmt(revenue) },
    { label: 'Ticket médio', value: fmt(valid.length ? revenue / valid.length : 0) },
  ];
  const shown = filter === 'Todos' ? orders : orders.filter((o) => o.status === filter);

  const update = (id: string, patch: Partial<CatalogOrder>) =>
    $catalogOrders.set($catalogOrders.get().map((o) => (o.id === id ? { ...o, ...patch } : o)));


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground">Pedidos feitos na loja e pelo catálogo do WhatsApp.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} size="sm">
            <CardHeader>
              <CardDescription className="font-mono text-[10px] tracking-[.14em] uppercase">{m.label}</CardDescription>
              <CardTitle className="text-2xl font-extrabold tabular-nums">{m.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="h-auto flex-wrap">
          {(['Todos', ...orderStatuses] as const).map((s) => (
            <TabsTrigger key={s} value={s}>
              {s}
              <span className="ml-1 text-xs text-muted-foreground tabular-nums">
                {s === 'Todos' ? orders.length : orders.filter((o) => o.status === s).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {orders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-start gap-3 py-6">
            <p className="text-muted-foreground">Nenhum pedido registrado ainda.</p>
            <Button variant="link" className="px-0" asChild>
              <a href={url.catalog} target="_blank" rel="noreferrer">Fazer um pedido no catálogo →</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="pr-4 text-right sm:pr-2">Total</TableHead>
                <TableHead className="hidden w-10 sm:table-cell" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Nenhum pedido com status “{filter}”.</TableCell>
                </TableRow>
              )}
              {shown.map((o) => {
                const open = openId === o.id;
                const qty = o.items.reduce((a, i) => a + i.qty, 0);
                return (
                  <Fragment key={o.id}>
                    <TableRow
                      className="cursor-pointer"
                      data-state={open ? 'selected' : undefined}
                      onClick={() => setOpenId(open ? null : o.id)}
                    >
                      <TableCell className="pl-4">
                        <div className="font-mono text-xs text-primary">{o.id}</div>
                        <div className="text-xs text-muted-foreground">{when(o.createdAt)}</div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div>{o.cliente}</div>
                        <div className="text-xs text-muted-foreground">{qty} {qty === 1 ? 'item' : 'itens'} ·{o.entrega} · {o.pagamento}</div>
                        {/* no celular o status vem embaixo do cliente, no lugar da coluna */}
                        <Badge className={cn('mt-1.5 font-mono text-[10px] tracking-wider uppercase sm:hidden', statusStyle[o.status])}>{o.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={cn('font-mono text-[10px] tracking-wider uppercase', statusStyle[o.status])}>{o.status}</Badge>
                      </TableCell>
                      <TableCell className="pr-4 text-right font-bold tabular-nums sm:pr-2">{fmt(o.total)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} aria-label={open ? 'Fechar detalhes' : 'Ver detalhes'} />
                      </TableCell>
                    </TableRow>
                    {open && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="bg-muted/30 p-4 whitespace-normal">
                          <div className="grid gap-6 md:grid-cols-3">
                            <div className="flex flex-col gap-2">
                              <span className="font-mono text-[10px] tracking-[.14em] text-muted-foreground uppercase">Itens</span>
                              {o.items.map((i, n) => (
                                <div key={n} className="flex justify-between gap-3 text-[13px] text-muted-foreground">
                                  <span>{i.qty}× {i.name} (tam {i.size})</span>
                                  <span className="whitespace-nowrap text-foreground tabular-nums">{fmt(i.price * i.qty)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-col gap-2 text-[13px] text-muted-foreground">
                              <span className="font-mono text-[10px] tracking-[.14em] uppercase">Cliente</span>
                              <span>{o.fone}</span>
                              <span>{o.entrega}{o.endereco ? ` — ${o.endereco}` : ''}</span>
                              <span>Pagamento: {o.pagamento}</span>
                              <span className="text-muted-foreground/70">{o.obs ? `Obs: ${o.obs}` : 'Sem observações'}</span>
                              <Button size="sm" className="self-start bg-wa text-wa-ink hover:bg-wa/85" asChild>
                                <a href={waReply(o)} target="_blank" rel="noreferrer"><MessageCircle />Responder no WhatsApp</a>
                              </Button>
                            </div>
                            <div className="flex flex-col gap-2">
                              <span className="font-mono text-[10px] tracking-[.14em] text-muted-foreground uppercase">Status</span>
                              <Select value={o.status} onValueChange={(v) => { update(o.id, { status: v as OrderStatus }); toast(`Pedido ${o.id}: ${v}`); }}>
                                <SelectTrigger className="w-full" aria-label="Status do pedido"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {orderStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-muted-foreground"><Trash2 />Excluir pedido</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir o pedido {o.id}?</AlertDialogTitle>
                                    <AlertDialogDescription>O pedido de {o.cliente} ({fmt(o.total)}) será removido da lista. Não dá para desfazer.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      variant="destructive"
                                      onClick={() => { $catalogOrders.set($catalogOrders.get().filter((x) => x.id !== o.id)); toast('Pedido excluído'); }}
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
