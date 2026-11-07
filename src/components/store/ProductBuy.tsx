import { useEffect, useState } from 'react';
import { addToCart, flash } from '@/lib/stores';
import type { Category, Product } from '@/lib/catalog';
import { SizeChip, panel } from './ui';

// Tabela de medidas de referência por tipo de peça (cm)
const guides: Record<'top' | 'bermuda' | 'calca' | 'tenis', { cols: string[]; rows: string[][]; note: string }> = {
  top: {
    cols: ['Tam', 'Largura do tórax', 'Comprimento'],
    rows: [['PP', '50', '68'], ['P', '52', '70'], ['M', '55', '72'], ['G', '58', '74'], ['GG', '61', '76']],
    note: 'Peça estendida, medida de axila a axila.',
  },
  bermuda: {
    cols: ['Tam', 'Cintura', 'Comprimento'],
    rows: [['P', '76–80', '50'], ['M', '81–86', '52'], ['G', '87–92', '54'], ['GG', '93–98', '56']],
    note: 'Cintura em volta do corpo; comprimento do cós à barra.',
  },
  calca: {
    cols: ['Tam', 'Cintura', 'Comprimento'],
    rows: [['P', '76–80', '104'], ['M', '81–86', '106'], ['G', '87–92', '108'], ['GG', '93–98', '110']],
    note: 'Cintura em volta do corpo; comprimento do cós à barra.',
  },
  tenis: {
    cols: ['Número', 'Comprimento do pé'],
    rows: [['39', '25,5'], ['41', '26,8'], ['43', '28,2']],
    note: 'Meça o pé descalço, do calcanhar ao dedo maior.',
  },
};

const guideFor = (cat: Category) =>
  cat === 'Tênis' ? guides.tenis : cat === 'Bermudas' ? guides.bermuda : cat === 'Calças' ? guides.calca : guides.top;

function SizeGuide({ cat, onClose }: { cat: Category; onClose: () => void }) {
  const g = guideFor(cat);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-[rgba(6,6,6,.78)] p-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="medidas" className={`${panel} flex w-full max-w-[420px] animate-lp-up flex-col gap-4 border-line-2 p-[26px]`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[.16em] text-gold">{cat}</span>
            <span id="medidas" className="text-xl font-extrabold tracking-[-.01em]">Tabela de medidas</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-xl leading-none text-dim hover:text-paper">×</button>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[.1em] text-stone">
              {g.cols.map((c) => <th key={c} className="py-2 font-normal">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {g.rows.map((r) => (
              <tr key={r[0]} className="border-b border-line">
                {r.map((v, i) => <td key={i} className={i === 0 ? 'py-2.5 font-semibold' : 'py-2.5 tabular-nums text-stone'}>{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <span className="text-xs leading-normal text-dim">Medidas em centímetros. {g.note} Ficou entre dois tamanhos? Escolha o maior.</span>
      </div>
    </div>
  );
}

// Escolha de tamanho + "Adicionar à sacola" na página do produto
export default function ProductBuy({ product }: { product: Pick<Product, 'id' | 'name' | 'cat' | 'price' | 'sizes' | 'image'> }) {
  const [size, setSize] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const team = product.cat === 'Camisas de time';

  function add() {
    if (!size) return flash('Escolha um tamanho primeiro');
    const custom = team ? [nome.trim().toUpperCase(), numero.trim()].filter(Boolean).join(' ') : '';
    addToCart(product, size, custom);
    flash(`${product.name} (${size}${custom ? ` · ${custom}` : ''}) na sacola`);
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[.14em] text-stone">Tamanho</span>
          <span className="flex items-baseline gap-3 text-xs text-dim">
            {size && <span>selecionado: {size}</span>}
            <button type="button" onClick={() => setGuideOpen(true)} className="text-gold underline-offset-2 hover:text-gold-hi hover:underline">tabela de medidas</button>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <SizeChip key={s} label={s} on={size === s} onClick={() => setSize(s)} className="min-w-[52px] py-3 text-sm" />
          ))}
        </div>
      </div>
      {team && (
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[.14em] text-stone">Personalizar (opcional, sem custo)</span>
          <div className="grid grid-cols-[1fr_88px] gap-2">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value.slice(0, 12))}
              placeholder="Nome nas costas"
              aria-label="Nome nas costas"
              className="rounded-[2px] border border-line-2 bg-ink px-3.5 py-3 text-sm text-paper uppercase outline-none placeholder:text-dim placeholder:normal-case focus:border-edge-2"
            />
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value.replace(/\D/g, '').slice(0, 2))}
              placeholder="Nº"
              aria-label="Número"
              inputMode="numeric"
              className="rounded-[2px] border border-line-2 bg-ink px-3.5 py-3 text-center text-sm text-paper outline-none placeholder:text-dim focus:border-edge-2"
            />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={add}
        className="rounded-[2px] bg-gold p-[18px] text-[15px] font-semibold tracking-[.02em] text-ink hover:bg-gold-hi"
      >
        Adicionar à sacola
      </button>
      {guideOpen && <SizeGuide cat={product.cat} onClose={() => setGuideOpen(false)} />}
    </>
  );
}
