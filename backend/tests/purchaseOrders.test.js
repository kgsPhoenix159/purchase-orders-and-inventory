import request from 'supertest';
import app from '../src/index.js';
import productStore from '../src/models/Product.js';
import poStore from '../src/models/PurchaseOrder.js';

beforeEach(() => {
  productStore.reset();
  poStore.reset();
});

function createPO(overrides = {}) {
  return request(app)
    .post('/api/purchase-orders')
    .send({
      vendorId: 'VND-001',
      lineItems: [
        { productId: 'PRD-001', qty: 10, unitPrice: 100 },
      ],
      ...overrides,
    });
}

describe('GET /api/products', () => {
  it('returns all seeded products with stock', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
    expect(res.body[0]).toHaveProperty('stock');
    expect(res.body[0]).toHaveProperty('name');
  });
});

describe('GET /api/vendors', () => {
  it('returns all seeded vendors', async () => {
    const res = await request(app).get('/api/vendors');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });
});

describe('POST /api/purchase-orders', () => {
  it('creates a draft PO with computed total', async () => {
    const res = await createPO();
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('draft');
    expect(res.body.total).toBe(1000); // 10 × 100
    expect(res.body.lineItems).toHaveLength(1);
  });

  it('rejects missing vendorId', async () => {
    const res = await request(app)
      .post('/api/purchase-orders')
      .send({ lineItems: [{ productId: 'PRD-001', qty: 1, unitPrice: 10 }] });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/vendorId/i);
  });

  it('rejects unknown vendorId', async () => {
    const res = await createPO({ vendorId: 'VND-999' });
    expect(res.status).toBe(404);
    expect(res.body.error.message).toMatch(/VND-999/);
  });

  it('rejects empty lineItems', async () => {
    const res = await createPO({ lineItems: [] });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/lineItems/i);
  });

  it('rejects unknown productId in line items', async () => {
    const res = await createPO({
      lineItems: [{ productId: 'PRD-999', qty: 1, unitPrice: 10 }],
    });
    expect(res.status).toBe(404);
    expect(res.body.error.message).toMatch(/PRD-999/);
  });

  it('rejects non-positive qty', async () => {
    const res = await createPO({
      lineItems: [{ productId: 'PRD-001', qty: -1, unitPrice: 10 }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/qty/i);
  });
});

describe('GET /api/purchase-orders', () => {
  it('returns an empty list when no POs exist', async () => {
    const res = await request(app).get('/api/purchase-orders');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns created POs', async () => {
    await createPO();
    const res = await request(app).get('/api/purchase-orders');
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('total');
  });
});

describe('GET /api/purchase-orders/:id', () => {
  it('returns a single PO', async () => {
    const created = await createPO();
    const res = await request(app).get(`/api/purchase-orders/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it('returns 404 for unknown PO', async () => {
    const res = await request(app).get('/api/purchase-orders/PO-999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/purchase-orders/:id/approve', () => {
  it('approves a draft PO', async () => {
    const created = await createPO();
    const res = await request(app).post(`/api/purchase-orders/${created.body.id}/approve`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });

  it('rejects approving a non-draft PO', async () => {
    const created = await createPO();
    await request(app).post(`/api/purchase-orders/${created.body.id}/approve`);

    const res = await request(app).post(`/api/purchase-orders/${created.body.id}/approve`);
    expect(res.status).toBe(409);
    expect(res.body.error.message).toMatch(/approved/i);
  });

  it('rejects approving a received PO', async () => {
    const created = await createPO();
    await request(app).post(`/api/purchase-orders/${created.body.id}/approve`);
    await request(app).post(`/api/purchase-orders/${created.body.id}/receive`);
    const res = await request(app).post(`/api/purchase-orders/${created.body.id}/approve`);
    expect(res.status).toBe(409);
    expect(res.body.error.message).toMatch(/received/i);
  });

  it('requires manager role for high-value POs', async () => {
    const created = await createPO({
      lineItems: [{ productId: 'PRD-004', qty: 10, unitPrice: 900 }], // total = $9,000
    });
    const res = await request(app).post(`/api/purchase-orders/${created.body.id}/approve`);
    expect(res.status).toBe(403);
    expect(res.body.error.message).toMatch(/manager/i);
  });

  it('allows manager to approve high-value POs', async () => {
    const created = await createPO({
      lineItems: [{ productId: 'PRD-004', qty: 10, unitPrice: 900 }],
    });
    const res = await request(app)
      .post(`/api/purchase-orders/${created.body.id}/approve?role=manager`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });
});

describe('POST /api/purchase-orders/:id/receive', () => {
  it('receives an approved PO and increases stock', async () => {

    const productsBefore = await request(app).get('/api/products');
    const steelBefore = productsBefore.body.find((p) => p.id === 'PRD-001');

    const created = await createPO({
      lineItems: [{ productId: 'PRD-001', qty: 25, unitPrice: 100 }],
    });
    await request(app).post(`/api/purchase-orders/${created.body.id}/approve`);

    const res = await request(app).post(`/api/purchase-orders/${created.body.id}/receive`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('received');

    const productsAfter = await request(app).get('/api/products');
    const steelAfter = productsAfter.body.find((p) => p.id === 'PRD-001');
    expect(steelAfter.stock).toBe(steelBefore.stock + 25);
  });

  it('rejects receiving a draft PO', async () => {
    const created = await createPO();
    const res = await request(app).post(`/api/purchase-orders/${created.body.id}/receive`);
    expect(res.status).toBe(409);
    expect(res.body.error.message).toMatch(/draft/i);
  });

  it('rejects double-receive (idempotency guard)', async () => {
    const created = await createPO();
    await request(app).post(`/api/purchase-orders/${created.body.id}/approve`);
    await request(app).post(`/api/purchase-orders/${created.body.id}/receive`);

    const res = await request(app).post(`/api/purchase-orders/${created.body.id}/receive`);
    expect(res.status).toBe(409);
    expect(res.body.error.message).toMatch(/already been received/i);
  });

  it('does not double-apply stock on second receive attempt', async () => {
    const created = await createPO({
      lineItems: [{ productId: 'PRD-002', qty: 50, unitPrice: 45 }],
    });
    await request(app).post(`/api/purchase-orders/${created.body.id}/approve`);
    await request(app).post(`/api/purchase-orders/${created.body.id}/receive`);

    const stockAfterFirst = (await request(app).get('/api/products')).body
      .find((p) => p.id === 'PRD-002').stock;

    await request(app).post(`/api/purchase-orders/${created.body.id}/receive`);

    const stockAfterSecond = (await request(app).get('/api/products')).body
      .find((p) => p.id === 'PRD-002').stock;

    expect(stockAfterSecond).toBe(stockAfterFirst);
  });
});

describe('Full PO lifecycle: create → approve → receive → verify stock', () => {
  it('completes the full flow correctly', async () => {

    const createRes = await request(app)
      .post('/api/purchase-orders')
      .send({
        vendorId: 'VND-002',
        lineItems: [
          { productId: 'PRD-003', qty: 100, unitPrice: 8.75 },
          { productId: 'PRD-005', qty: 30, unitPrice: 32 },
        ],
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.total).toBe(100 * 8.75 + 30 * 32); // 875 + 960 = 1835

    const poId = createRes.body.id;

    const approveRes = await request(app).post(`/api/purchase-orders/${poId}/approve`);
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.status).toBe('approved');

    const receiveRes = await request(app).post(`/api/purchase-orders/${poId}/receive`);
    expect(receiveRes.status).toBe(200);
    expect(receiveRes.body.status).toBe('received');

    const products = (await request(app).get('/api/products')).body;
    const pcb = products.find((p) => p.id === 'PRD-003');
    const bearing = products.find((p) => p.id === 'PRD-005');

    expect(pcb.stock).toBe(500 + 100);     // seed + received
    expect(bearing.stock).toBe(120 + 30);   // seed + received
  });
});
