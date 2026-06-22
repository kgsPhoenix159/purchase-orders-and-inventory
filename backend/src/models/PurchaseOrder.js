import AppError from '../errors/AppError.js';
import productStore from './Product.js';
import vendorStore from './Vendor.js';

const MANAGER_APPROVAL_THRESHOLD = 5000;

const TRANSITIONS = {
  draft: 'approved',
  approved: 'received',
};

class PurchaseOrderStore {
  constructor() {
    this.orders = new Map();
    this._counter = 0;
  }

  _nextId() {
    this._counter += 1;
    return `PO-${String(this._counter).padStart(3, '0')}`;
  }

  
  static computeTotal(lineItems) {
    return lineItems.reduce(
      (sum, li) => sum + li.qty * li.unitPrice,
      0,
    );
  }

  
  _withTotal(po) {
    return {
      ...po,
      total: PurchaseOrderStore.computeTotal(po.lineItems),
    };
  }

  getAll() {
    return Array.from(this.orders.values()).map((po) => this._withTotal(po));
  }

  getById(id) {
    const po = this.orders.get(id);
    if (!po) return null;
    return this._withTotal(po);
  }

  
  create({ vendorId, lineItems }) {

    if (!vendorId) {
      throw new AppError(400, 'vendorId is required.');
    }
    if (!vendorStore.exists(vendorId)) {
      throw new AppError(404, `Vendor '${vendorId}' not found.`);
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      throw new AppError(400, 'lineItems must be a non-empty array.');
    }

    for (const [i, li] of lineItems.entries()) {
      if (!li.productId) {
        throw new AppError(400, `lineItems[${i}].productId is required.`);
      }
      if (!productStore.exists(li.productId)) {
        throw new AppError(404, `Product '${li.productId}' not found.`);
      }
      if (typeof li.qty !== 'number' || li.qty <= 0 || !Number.isInteger(li.qty)) {
        throw new AppError(400, `lineItems[${i}].qty must be a positive integer.`);
      }
      if (typeof li.unitPrice !== 'number' || li.unitPrice < 0) {
        throw new AppError(400, `lineItems[${i}].unitPrice must be a non-negative number.`);
      }
    }

    const now = new Date().toISOString();
    const po = {
      id: this._nextId(),
      vendorId,
      status: 'draft',
      lineItems: lineItems.map((li) => ({
        productId: li.productId,
        qty: li.qty,
        unitPrice: li.unitPrice,
      })),
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(po.id, po);
    return this._withTotal(po);
  }

  
  approve(id, { role } = {}) {
    const po = this.orders.get(id);
    if (!po) throw new AppError(404, `Purchase order '${id}' not found.`);

    if (po.status !== 'draft') {
      throw new AppError(
        409,
        `Cannot approve a PO that is in '${po.status}' status. Only 'draft' POs can be approved.`,
      );
    }

    const total = PurchaseOrderStore.computeTotal(po.lineItems);
    if (total > MANAGER_APPROVAL_THRESHOLD && role !== 'manager') {
      throw new AppError(
        403,
        `POs over $${MANAGER_APPROVAL_THRESHOLD.toLocaleString()} require manager approval. Pass ?role=manager to authorize.`,
      );
    }

    po.status = TRANSITIONS.draft;
    po.updatedAt = new Date().toISOString();
    return this._withTotal(po);
  }

  
  receive(id) {
    const po = this.orders.get(id);
    if (!po) throw new AppError(404, `Purchase order '${id}' not found.`);

    if (po.status === 'received') {
      throw new AppError(
        409,
        'This PO has already been received. Stock was applied when it was first received.',
      );
    }

    if (po.status !== 'approved') {
      throw new AppError(
        409,
        `Cannot receive a PO that is in '${po.status}' status. Only 'approved' POs can be received.`,
      );
    }

    for (const li of po.lineItems) {
      productStore.increaseStock(li.productId, li.qty);
    }

    po.status = TRANSITIONS.approved;
    po.updatedAt = new Date().toISOString();
    return this._withTotal(po);
  }

  
  reset() {
    this.orders.clear();
    this._counter = 0;
  }
}

export default new PurchaseOrderStore();

