import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { approvePurchaseOrder, receivePurchaseOrder } from '../api/client';
import { toast } from './Toast';

export default function POList({ orders, onUpdated, onSelect }) {
  const [loadingAction, setLoadingAction] = useState(null); // "approve-PO-001" etc.

  const handleApprove = async (po) => {
    const actionKey = `approve-${po.id}`;
    setLoadingAction(actionKey);
    try {

      const opts = {};
      if (po.total > 5000) {
        const confirm = window.confirm(
          `This PO totals $${po.total.toFixed(2)} (over $5,000) and requires manager approval.\n\nApprove as manager?`
        );
        if (!confirm) {
          setLoadingAction(null);
          return;
        }
        opts.role = 'manager';
      }
      await approvePurchaseOrder(po.id, opts);
      toast.success(`${po.id} approved`);
      onUpdated?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReceive = async (po) => {
    const actionKey = `receive-${po.id}`;
    setLoadingAction(actionKey);
    try {
      await receivePurchaseOrder(po.id);
      toast.success(`${po.id} received — inventory updated`);
      onUpdated?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-surface-800 bg-surface-900/50 px-6 py-16 text-center">
        <div className="mb-3 text-4xl">📋</div>
        <p className="text-surface-400">No purchase orders yet.</p>
        <p className="mt-1 text-sm text-surface-600">Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-surface-800 bg-surface-900/50 shadow-xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-800 bg-surface-800/40">
            <th className="px-6 py-4 text-left font-semibold text-surface-300">PO #</th>
            <th className="px-6 py-4 text-left font-semibold text-surface-300">Vendor</th>
            <th className="px-6 py-4 text-left font-semibold text-surface-300">Items</th>
            <th className="px-6 py-4 text-right font-semibold text-surface-300">Total</th>
            <th className="px-6 py-4 text-center font-semibold text-surface-300">Status</th>
            <th className="px-6 py-4 text-right font-semibold text-surface-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((po, i) => (
            <tr
              key={po.id}
              className="stagger-row border-b border-surface-800/50 transition-colors hover:bg-surface-800/30"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <td className="px-6 py-4">
                <button
                  onClick={() => onSelect?.(po)}
                  className="font-medium text-primary-400 transition-colors hover:text-primary-300 hover:underline cursor-pointer"
                >
                  {po.id}
                </button>
              </td>
              <td className="px-6 py-4 text-surface-300">{po.vendorId}</td>
              <td className="px-6 py-4 text-surface-400">{po.lineItems.length} item(s)</td>
              <td className="px-6 py-4 text-right font-mono font-medium text-white">
                ${po.total.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-center">
                <StatusBadge status={po.status} />
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {po.status === 'draft' && (
                    <button
                      onClick={() => handleApprove(po)}
                      disabled={loadingAction === `approve-${po.id}`}
                      className="rounded-lg bg-success-600/15 px-3 py-1.5 text-xs font-semibold text-success-500 transition-all hover:bg-success-600/25 disabled:opacity-50 cursor-pointer"
                    >
                      {loadingAction === `approve-${po.id}` ? '…' : '✓ Approve'}
                    </button>
                  )}
                  {po.status === 'approved' && (
                    <button
                      onClick={() => handleReceive(po)}
                      disabled={loadingAction === `receive-${po.id}`}
                      className="rounded-lg bg-info-600/15 px-3 py-1.5 text-xs font-semibold text-info-500 transition-all hover:bg-info-600/25 disabled:opacity-50 cursor-pointer"
                    >
                      {loadingAction === `receive-${po.id}` ? '…' : '📦 Receive'}
                    </button>
                  )}
                  {po.status === 'received' && (
                    <span className="px-3 py-1.5 text-xs text-surface-600">Completed</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
