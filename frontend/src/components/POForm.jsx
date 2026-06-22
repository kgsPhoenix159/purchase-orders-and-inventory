import { useState } from 'react';
import { fetchVendors, fetchProducts, createPurchaseOrder } from '../api/client';
import { toast } from './Toast';

export default function POForm({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [lineItems, setLineItems] = useState([{ productId: '', qty: 1, unitPrice: 0 }]);
  const [submitting, setSubmitting] = useState(false);

  const loadFormData = async () => {
    try {
      const [v, p] = await Promise.all([fetchVendors(), fetchProducts()]);
      setVendors(v);
      setProducts(p);
    } catch (err) {
      toast.error('Failed to load form data: ' + err.message);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    loadFormData();
  };

  const handleClose = () => {
    setOpen(false);
    setVendorId('');
    setLineItems([{ productId: '', qty: 1, unitPrice: 0 }]);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { productId: '', qty: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index, field, value) => {
    setLineItems(lineItems.map((li, i) =>
      i === index ? { ...li, [field]: value } : li
    ));
  };

  const handleProductSelect = (index, productId) => {
    const product = products.find((p) => p.id === productId);
    setLineItems(lineItems.map((li, i) =>
      i === index
        ? { ...li, productId, unitPrice: product ? product.unitCost : 0 }
        : li
    ));
  };

  const total = lineItems.reduce((sum, li) => sum + li.qty * li.unitPrice, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const po = await createPurchaseOrder({
        vendorId,
        lineItems: lineItems.map((li) => ({
          productId: li.productId,
          qty: Number(li.qty),
          unitPrice: Number(li.unitPrice),
        })),
      });
      toast.success(`Purchase Order ${po.id} created successfully`);
      handleClose();
      onCreated?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-500 hover:shadow-primary-500/30 cursor-pointer"
      >
        <span className="text-lg leading-none">+</span>
        New Purchase Order
      </button>
    );
  }

  return (
    <div className="animate-fade-in rounded-xl border border-surface-700 bg-surface-900/80 p-6 shadow-2xl backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Create Purchase Order</h3>
        <button
          onClick={handleClose}
          className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-800 hover:text-white cursor-pointer"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {}
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-surface-300">Vendor</label>
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            required
            className="w-full rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
          >
            <option value="">Select a vendor…</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        {}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-surface-300">Line Items</label>
            <button
              type="button"
              onClick={addLineItem}
              className="text-xs font-medium text-primary-400 transition-colors hover:text-primary-300 cursor-pointer"
            >
              + Add item
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((li, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-surface-800 bg-surface-800/40 p-3">
                {}
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-surface-500">Product</label>
                  <select
                    value={li.productId}
                    onChange={(e) => handleProductSelect(i, e.target.value)}
                    required
                    className="w-full rounded-md border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
                  >
                    <option value="">Select…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {}
                <div className="w-24">
                  <label className="mb-1 block text-xs text-surface-500">Qty</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={li.qty}
                    onChange={(e) => updateLineItem(i, 'qty', parseInt(e.target.value) || 0)}
                    required
                    className="w-full rounded-md border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
                  />
                </div>

                {}
                <div className="w-28">
                  <label className="mb-1 block text-xs text-surface-500">Unit Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={li.unitPrice}
                    onChange={(e) => updateLineItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                    required
                    className="w-full rounded-md border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-primary-500"
                  />
                </div>

                {}
                <div className="w-24 pt-5 text-right">
                  <span className="text-sm font-mono text-surface-300">
                    ${(li.qty * li.unitPrice).toFixed(2)}
                  </span>
                </div>

                {}
                <button
                  type="button"
                  onClick={() => removeLineItem(i)}
                  disabled={lineItems.length === 1}
                  className="mt-6 shrink-0 rounded p-1 text-surface-600 transition-colors hover:text-danger-500 disabled:invisible cursor-pointer"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="flex items-center justify-between border-t border-surface-800 pt-5">
          <div>
            <span className="text-sm text-surface-400">Total: </span>
            <span className="text-xl font-bold text-white font-mono">${total.toFixed(2)}</span>
            {total > 5000 && (
              <span className="ml-3 rounded-full bg-warning-500/15 px-2.5 py-0.5 text-xs font-medium text-warning-500">
                Requires manager approval
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-surface-700 px-4 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-500 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating…' : 'Create PO'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
