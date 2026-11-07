import { resetDemo } from '@/lib/stores';

// Link discreto do rodapé: apaga as interações e volta a demo para os dados do banco local
export default function ResetDemo() {
  function reset() {
    if (!window.confirm('Restaurar a demo? Sacola, login, pedidos e edições do admin voltam ao original.')) return;
    resetDemo();
    window.location.reload();
  }

  return (
    <button type="button" onClick={reset} className="uppercase tracking-[.1em] text-faint hover:text-stone">
      Restaurar demo
    </button>
  );
}
