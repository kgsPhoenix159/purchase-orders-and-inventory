import { Router } from 'express';
import vendorStore from '../models/Vendor.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(vendorStore.getAll());
});

export default router;
