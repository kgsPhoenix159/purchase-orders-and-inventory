import { seedVendors } from '../data/seed.js';

class VendorStore {
  constructor() {
    this.vendors = new Map();
    this._seed();
  }

  _seed() {
    for (const v of seedVendors) {
      this.vendors.set(v.id, { ...v });
    }
  }

  getAll() {
    return Array.from(this.vendors.values());
  }

  getById(id) {
    return this.vendors.get(id) || null;
  }

  exists(id) {
    return this.vendors.has(id);
  }

  
  reset() {
    this.vendors.clear();
    this._seed();
  }
}

export default new VendorStore();

