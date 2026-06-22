import { useEffect, useState } from 'react';
import { fetchPurchaseOrder } from '../api/client';
import StatusBadge from './StatusBadge';

export default function PODetail({ poId, onClose }) {
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!poId) return;
    setLoading(true);
    fetchPurchaseOrder(poId)
      .then((data) => { setPo(data); setError(null); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [poId]);

  if (!poId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="animate-fade-in w-full max-w-lg rounded-2xl border border-surface-700 bg-surface-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            Purchase Order {poId}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-800 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-5 animate-pulse-subtle rounded bg-surface-800" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-500">
            {error}
          </div>
        ) : po ? (
          <div className="space-y-5">
            {}
            <div className="flex items-center gap-4">
              <StatusBadge status={po.status} />
              <span className="text-sm text-surface-400">Vendor: <span className="text-surface-200">{po.vendorId}</span></span>
            </div>

            {}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-surface-300">Line Items</h3>
              <div className="rounded-lg border border-surface-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-800/40">
                      <th className="px-4 py-2 text-left text-xs font-medium text-surface-400">Product</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-surface-400">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-surface-400">Unit Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-surface-400">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {po.lineItems.map((li, i) => (
                      <tr key={i} className="border-t border-surface-800/50">
                        <td className="px-4 py-2.5 text-surface-200">{li.productId}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-surface-300">{li.qty}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-surface-300">${li.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-medium text-white">
                          ${(li.qty * li.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {}
            <div className="flex items-center justify-between border-t border-surface-800 pt-4">
              <span className="text-sm font-medium text-surface-400">Total</span>
              <span className="text-xl font-bold font-mono text-white">${po.total.toFixed(2)}</span>
            </div>

            {}
            <div className="flex gap-6 text-xs text-surface-500">
              <span>Created: {new Date(po.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(po.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
