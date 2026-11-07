import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { $adminProducts } from '@/lib/stores';
import { categories, fmt, slugify, type Category, type Product } from '@/lib/catalog';

interface Form {
  name: string;
  cat: Category;
  price: string;
  sizes: string;
  stock: string;
  shot: string;
  image: string;
  ativo: boolean;
}

const empty: Form = { name: '', cat: 'Camisas', price: '', sizes: '', stock: '', shot: '', image: '', ativo: true };

function state(p: Product) {
  if (p.ativo === false) return { label: 'Oculto', className: 'bg-muted text-muted-foreground' };
  if ((p.stock || 0) <= 5) return { label: 'Estoque baixo', className: 'bg-[#C98080]/15 text-[#C98080]' };
  return { label: 'Ativo', className: 'bg-[#8CBE79]/15 text-[#8CBE79]' };
}

export default function ProductsPanel() {
  const products = useStore($adminProducts);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(empty);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const save = (list: Product[]) => $adminProducts.set(list);
  const reset = () => { setEditing(null); setForm(empty); };

  function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return toast.error('Informe o nome do produto');
    const price = parseFloat(form.price.replace(/\./g, '').replace(',', '.')) || 0;
    if (!price) return toast.error('Informe um preço válido');
    const sizes = form.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    const data = {
      name,
      slug: slugify(name),
      cat: form.cat,
      price,
      sizes: sizes.length ? sizes : ['P', 'M', 'G'],
      stock: parseInt(form.stock, 10) || 0,
      shot: form.shot.trim() || `${name.toLowerCase()} — frente`,
      image: form.image.trim() || undefined,
      ativo: form.ativo,
    };
    if (editing !== null) {
      save(products.map((p) => (p.id === editing ? { ...p, ...data } : p)));
      toast.success('Produto atualizado');
    } else {
      const id = products.reduce((a, p) => Math.max(a, p.id || 0), 0) + 1;
      save([{ id, desc: '', ...data }, ...products]);
      toast.success('Produto cadastrado');
    }
    reset();
  }

  function edit(p: Product) {
    setEditing(p.id);
    setForm({
      name: p.name,
      cat: p.cat,
      price: String(p.price).replace('.', ','),
      sizes: (p.sizes || []).join(', '),
      stock: String(p.stock ?? ''),
      shot: p.shot || '',
      image: p.image || '',
      ativo: p.ativo !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const active = products.filter((p) => p.ativo !== false).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground">Os produtos ativos aparecem no catálogo do WhatsApp.</p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{products.length} cadastrados · {active} ativos</span>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>{editing !== null ? 'Editar produto' : 'Novo produto'}</CardTitle>
            <CardDescription>{editing !== null ? 'As mudanças valem na hora para o catálogo.' : 'Preencha e cadastre.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="p-name">Nome</Label>
                <Input id="p-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Camisa Oversized Preta" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="p-cat">Categoria</Label>
                  <Select value={form.cat} onValueChange={(v) => set('cat', v as Category)}>
                    <SelectTrigger id="p-cat" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="p-price">Preço (R$)</Label>
                  <Input id="p-price" inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="129,90" />
                </div>
              </div>
              <div className="grid grid-cols-[1fr_90px] gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="p-sizes">Tamanhos</Label>
                  <Input id="p-sizes" value={form.sizes} onChange={(e) => set('sizes', e.target.value)} placeholder="P, M, G, GG" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="p-stock">Estoque</Label>
                  <Input id="p-stock" inputMode="numeric" value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="12" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="p-shot">Descrição da foto</Label>
                  <Input id="p-shot" value={form.shot} onChange={(e) => set('shot', e.target.value)} placeholder="camisa preta — frente" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="p-image">URL ou caminho da imagem</Label>
                  <Input id="p-image" value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="/images/produtos/camisa.jpg" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="p-ativo" className="font-normal">Visível no catálogo</Label>
                <Switch id="p-ativo" checked={form.ativo} onCheckedChange={(v) => set('ativo', v)} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">{editing !== null ? 'Salvar alterações' : 'Cadastrar produto'}</Button>
                <Button type="button" variant="outline" onClick={reset}>Limpar</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Produto</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="pr-4 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const s = state(p);
                return (
                  <TableRow key={p.id} data-state={editing === p.id ? 'selected' : undefined}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-[46px] w-9 shrink-0 overflow-hidden rounded-sm bg-muted border border-border">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="photo h-full w-full" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate">{p.name}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">
                            {p.cat} · {(p.sizes || []).join('/')} · estoque {p.stock || 0}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary tabular-nums">{fmt(p.price)}</TableCell>
                    <TableCell><Badge className={s.className}>{s.label}</Badge></TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => edit(p)} aria-label={`Editar ${p.name}`} title="Editar"><Pencil /></Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => save(products.map((x) => (x.id === p.id ? { ...x, ativo: x.ativo === false } : x)))}
                          aria-label={p.ativo === false ? `Mostrar ${p.name}` : `Ocultar ${p.name}`}
                          title={p.ativo === false ? 'Mostrar no catálogo' : 'Ocultar do catálogo'}
                        >
                          {p.ativo === false ? <Eye /> : <EyeOff />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${p.name}`} title="Excluir"><Trash2 /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir “{p.name}”?</AlertDialogTitle>
                              <AlertDialogDescription>O produto sai do catálogo e da lista. Não dá para desfazer.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => {
                                  save(products.filter((x) => x.id !== p.id));
                                  if (editing === p.id) reset();
                                  toast('Produto excluído');
                                }}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
