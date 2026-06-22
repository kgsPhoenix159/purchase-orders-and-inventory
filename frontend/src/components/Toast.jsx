import { useEffect, useState } from 'react';

let _setToasts;

export const toast = {
  _add(type, message) {
    if (!_setToasts) return;
    const id = Date.now() + Math.random();
    _setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      _setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  },
  success(message) { this._add('success', message); },
  error(message)   { this._add('error', message); },
  info(message)    { this._add('info', message); },
};

const icons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const colors = {
  success: 'border-success-500/40 bg-success-500/10 text-success-500',
  error:   'border-danger-500/40 bg-danger-500/10 text-danger-500',
  info:    'border-info-500/40 bg-info-500/10 text-info-500',
};

export default function Toast() {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;

  useEffect(() => {
    return () => { _setToasts = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-slide-in-right flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-lg ${colors[t.type]}`}
          style={{ maxWidth: '420px' }}
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/20 text-xs font-bold">
            {icons[t.type]}
          </span>
          <p className="text-sm font-medium leading-relaxed text-surface-100">{t.message}</p>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="ml-auto shrink-0 text-surface-500 hover:text-surface-300 transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
