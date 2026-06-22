import { useEffect, useState } from 'react';
import { fetchPurchaseOrders } from '../api/client';
import POForm from '../components/POForm';
import POList from '../components/POList';
import PODetail from '../components/PODetail';

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPO, setSelectedPO] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchPurchaseOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = {
    total: orders.length,
    draft: orders.filter((o) => o.status === 'draft').length,
    approved: orders.filter((o) => o.status === 'approved').length,
    received: orders.filter((o) => o.status === 'received').length,
    value: orders.reduce((s, o) => s + o.total, 0),
  };

  return (
    <div className="animate-fade-in space-y-8">
      {}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Purchase Orders</h1>
          <p className="mt-1 text-sm text-surface-400">
            Create, approve, and receive purchase orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-800/60 px-4 py-2 text-sm font-medium text-surface-300 transition-all hover:border-surface-600 hover:bg-surface-700/60 hover:text-white cursor-pointer"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total POs', value: stats.total, color: 'text-white' },
            { label: 'Draft', value: stats.draft, color: 'text-warning-500' },
            { label: 'Approved', value: stats.approved, color: 'text-success-500' },
            { label: 'Total Value', value: `$${stats.value.toFixed(2)}`, color: 'text-primary-400' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-surface-800 bg-surface-900/50 px-4 py-3"
            >
              <div className="text-xs font-medium text-surface-500">{s.label}</div>
              <div className={`mt-1 text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {}
      <POForm onCreated={load} />

      {}
      {error && (
        <div className="rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-500">
          {error}
        </div>
      )}

      {}
      {loading ? (
        <div className="overflow-hidden rounded-xl border border-surface-800 bg-surface-900/50">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-surface-800/50 px-6 py-4">
              {[1, 2, 3, 4].map((c) => (
                <div key={c} className="h-4 flex-1 animate-pulse-subtle rounded bg-surface-700/60" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <POList orders={orders} onUpdated={load} onSelect={(po) => setSelectedPO(po.id)} />
      )}

      {}
      <PODetail poId={selectedPO} onClose={() => setSelectedPO(null)} />
    </div>
  );
}
