const BASE = '/api';

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    const message = data?.error?.message || `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return data;
}

export function fetchProducts() {
  return request('/products');
}

export function fetchVendors() {
  return request('/vendors');
}

export function fetchPurchaseOrders() {
  return request('/purchase-orders');
}

export function fetchPurchaseOrder(id) {
  return request(`/purchase-orders/${id}`);
}

export function createPurchaseOrder(body) {
  return request('/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function approvePurchaseOrder(id, { role } = {}) {
  const query = role ? `?role=${role}` : '';
  return request(`/purchase-orders/${id}/approve${query}`, {
    method: 'POST',
  });
}

export function receivePurchaseOrder(id) {
  return request(`/purchase-orders/${id}/receive`, {
    method: 'POST',
  });
}
