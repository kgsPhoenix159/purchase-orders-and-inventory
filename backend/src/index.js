import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import errorHandler from './middleware/errorHandler.js';
import productRoutes from './routes/products.js';
import vendorRoutes from './routes/vendors.js';
import poRoutes from './routes/purchaseOrders.js';

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/purchase-orders', poRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Purchase Orders & Inventory API running on http://localhost:${PORT}`);
  });
}

export default app;
