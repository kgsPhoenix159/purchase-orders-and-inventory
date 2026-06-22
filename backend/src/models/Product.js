import { seedProducts } from '../data/seed.js';

class ProductStore {
  constructor() {
    this.products = new Map();
    this._seed();
  }

  _seed() {
    for (const p of seedProducts) {
      this.products.set(p.id, { ...p });
    }
  }

  getAll() {
    return Array.from(this.products.values());
  }

  getById(id) {
    return this.products.get(id) || null;
  }

  exists(id) {
    return this.products.has(id);
  }

  increaseStock(productId, qty) {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    product.stock += qty;
  }

  reset() {
    this.products.clear();
    this._seed();
  }
}

export default new ProductStore();

