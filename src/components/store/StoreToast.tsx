import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $toast, flash, takeQueuedToast } from '@/lib/stores';

export default function StoreToast() {
  const toast = useStore($toast);

  useEffect(() => {
    const pending = takeQueuedToast();
    if (pending) flash(pending);
  }, []);

  if (!toast) return null;
  return (
    <div
      role="status"
      className="fixed bottom-7 left-1/2 z-40 -translate-x-1/2 animate-lp-up rounded-[2px] bg-paper px-5 py-3.5 text-sm font-medium text-ink shadow-[0_10px_40px_rgba(0,0,0,.5)]"
    >
      {toast}
    </div>
  );
}
