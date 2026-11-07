// Peças visuais reutilizadas nas páginas públicas (fora do shadcn, no visual original da loja).
import { cn } from '@/lib/utils';
import { fmt, url, type Product } from '@/lib/catalog';

export const btn = {
  gold: 'inline-flex items-center justify-center rounded-[2px] bg-gold px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-hi',
  outline: 'inline-flex items-center justify-center rounded-[2px] border border-edge-2 px-6 py-3.5 text-sm text-paper transition-colors hover:border-stone',
  link: 'text-[13px] text-gold hover:text-gold-hi',
  wa: 'inline-flex items-center justify-center rounded-[2px] bg-wa px-5 py-3 text-sm font-semibold text-wa-ink',
};

export const field =
  'rounded-[2px] border border-line-2 bg-ink px-3.5 py-3 text-sm text-paper outline-none placeholder:text-dim focus:border-edge-2';

export const panel = 'border border-line bg-panel';

export function Eyebrow({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn('eyebrow text-stone', className)}>{children}</span>;
}

export function Shot({
  src,
  alt,
  label,
  className,
  large,
}: {
  src?: string;
  alt?: string;
  label?: string;
  className?: string;
  large?: boolean;
}) {
  if (src) {
    return (
      <div className={cn('relative overflow-hidden bg-tile', className)}>
        <img
          src={src}
          alt={alt || label || 'Foto do produto'}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {label && (
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/60 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="font-mono text-[10px] uppercase tracking-[.06em] text-paper/80">{label}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(large ? 'photo-lg' : 'photo', 'flex items-end p-3', className)}>
      {label && <span className="font-mono text-[10px] uppercase tracking-[.06em] text-dim">{label}</span>}
    </div>
  );
}

type CardProduct = Pick<Product, 'slug' | 'name' | 'cat' | 'shot' | 'price' | 'image'>;

export function ProductCard({ p }: { p: CardProduct }) {
  return (
    <a href={url.product(p)} className="group flex flex-col border border-line-2 bg-tile text-paper transition-colors hover:border-edge-2">
      <Shot src={p.image} label={p.shot} alt={p.name} className="aspect-[3/4]" />
      <div className="flex flex-col gap-1.5 p-3.5">
        <span className="font-mono text-[10px] uppercase tracking-[.1em] text-dim">{p.cat}</span>
        <span className="text-sm leading-snug">{p.name}</span>
        <span className="text-[15px] font-semibold text-gold">{fmt(p.price)}</span>
      </div>
    </a>
  );
}

export function SizeChip({ label, on, onClick, className }: { label: string; on: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'min-w-[42px] rounded-[2px] border px-1 py-2 text-[13px] transition-colors',
        on ? 'border-gold bg-gold text-ink' : 'border-edge bg-transparent text-paper hover:border-stone',
        className,
      )}
    >
      {label}
    </button>
  );
}

export function QtyStepper({ qty, onDec, onInc }: { qty: number; onDec: () => void; onInc: () => void }) {
  return (
    <div className="flex items-center rounded-[2px] border border-line-2">
      <button type="button" onClick={onDec} className="px-3 py-1.5 text-[15px] text-paper" aria-label="Diminuir">−</button>
      <span className="min-w-5 text-center text-[13px]">{qty}</span>
      <button type="button" onClick={onInc} className="px-3 py-1.5 text-[15px] text-paper" aria-label="Aumentar">+</button>
    </div>
  );
}
