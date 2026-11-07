import { useState } from 'react';
import { flash } from '@/lib/stores';
import { btn, field } from './ui';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) return flash('Informe um e-mail válido');
    setEmail('');
    flash('Pronto, você está na lista');
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2.5">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        aria-label="E-mail"
        className={`${field} flex-[1_1_180px] py-3.5`}
      />
      <button type="submit" className={btn.gold}>Quero receber</button>
    </form>
  );
}
