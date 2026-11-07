// Galeria da página de produto: foto grande + miniaturas clicáveis + tela cheia ao tocar na foto.
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Shot } from '@/components/store/ui';

const views = ['frente', 'costas', 'detalhe do tecido', 'vestido'];
const altFor = (name: string, i: number, total: number) => `${name}, ${views[i] ?? `foto ${i + 1}`} (${i + 1} de ${total})`;

export default function ProductGallery({ images, name, label }: { images: string[]; name: string; label?: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const total = images.length;
  const go = (d: number) => setActive((i) => (i + d + total) % total);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [zoom, total]);

  if (total === 0) {
    return <Shot alt={name} label={label} large className="aspect-[4/5] border border-line-2" />;
  }

  const arrow = 'absolute top-1/2 -translate-y-1/2 rounded-[2px] bg-ink/70 px-3.5 py-2.5 text-lg text-paper hover:bg-ink';

  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label={`Ampliar foto de ${name}`}
        className="relative aspect-[4/5] cursor-zoom-in overflow-hidden border border-line-2 bg-tile"
      >
        <img src={images[active]} alt={altFor(name, active, total)} className="h-full w-full object-cover" />
        <span className="absolute right-3 bottom-3 rounded-[2px] bg-ink/70 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[.1em] text-paper">ampliar</span>
      </button>
      {total > 1 && (
        <div className="grid grid-cols-4 gap-2.5">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1} de ${name}`}
              aria-pressed={i === active}
              className={cn(
                'aspect-square overflow-hidden border bg-tile transition-colors',
                i === active ? 'border-gold' : 'border-line-2 opacity-70 hover:border-edge-2 hover:opacity-100',
              )}
            >
              <img src={src} alt={altFor(name, i, total)} loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${name}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(6,6,6,.94)] p-4"
          onClick={(e) => e.target === e.currentTarget && setZoom(false)}
        >
          <img src={images[active]} alt={altFor(name, active, total)} className="max-h-full max-w-full object-contain" />
          <button type="button" onClick={() => setZoom(false)} aria-label="Fechar" className="absolute top-4 right-4 rounded-[2px] bg-ink/70 px-3.5 py-2 text-xl leading-none text-paper hover:bg-ink">×</button>
          {total > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className={`${arrow} left-3`}>←</button>
              <button type="button" onClick={() => go(1)} aria-label="Próxima foto" className={`${arrow} right-3`}>→</button>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs text-stone">{active + 1} / {total}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
