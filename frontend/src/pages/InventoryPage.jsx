import { useEffect, useState } from 'react';
import { fetchProducts } from '../api/client';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="animate-fade-in">
      {}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="mt-1 text-sm text-surface-400">
            Current stock levels for all products
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-800/60 px-4 py-2 text-sm font-medium text-surface-300 transition-all hover:border-surface-600 hover:bg-surface-700/60 hover:text-white cursor-pointer"
        >
          ↻ Refresh
        </button>
      </div>

      {}
      {error && (
        <div className="mb-6 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-500">
          {error}
        </div>
      )}

      {}
      <div className="overflow-hidden rounded-xl border border-surface-800 bg-surface-900/50 shadow-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-800 bg-surface-800/40">
              <th className="px-6 py-4 text-left font-semibold text-surface-300">Product</th>
              <th className="px-6 py-4 text-left font-semibold text-surface-300">SKU</th>
              <th className="px-6 py-4 text-right font-semibold text-surface-300">Unit Cost</th>
              <th className="px-6 py-4 text-right font-semibold text-surface-300">In Stock</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (

              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-surface-800/50">
                  {[1, 2, 3, 4].map((c) => (
                    <td key={c} className="px-6 py-4">
                      <div className="h-4 w-24 animate-pulse-subtle rounded bg-surface-700/60" />
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-surface-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p, i) => (
                <tr
                  key={p.id}
                  className="stagger-row border-b border-surface-800/50 transition-colors hover:bg-surface-800/30"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{p.name}</div>
                    <div className="text-xs text-surface-500">{p.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="rounded bg-surface-800 px-2 py-0.5 text-xs text-surface-300">
                      {p.sku}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-surface-300">
                    ${p.unitCost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex min-w-[3rem] items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${
                        p.stock > 100
                          ? 'bg-success-500/15 text-success-500'
                          : p.stock > 20
                            ? 'bg-warning-500/15 text-warning-500'
                            : 'bg-danger-500/15 text-danger-500'
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
