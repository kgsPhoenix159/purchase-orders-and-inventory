import { Router } from 'express';
import productStore from '../models/Product.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(productStore.getAll());
});

export default router;
