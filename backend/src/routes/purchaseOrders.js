import { Router } from 'express';
import poStore from '../models/PurchaseOrder.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(poStore.getAll());
});

router.post('/', (req, res, next) => {
  try {
    const po = poStore.create(req.body);
    res.status(201).json(po);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const po = poStore.getById(req.params.id);
    if (!po) {
      return res.status(404).json({
        error: { status: 404, message: `Purchase order '${req.params.id}' not found.` },
      });
    }
    res.json(po);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/approve', (req, res, next) => {
  try {
    const po = poStore.approve(req.params.id, { role: req.query.role });
    res.json(po);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/receive', (req, res, next) => {
  try {
    const po = poStore.receive(req.params.id);
    res.json(po);
  } catch (err) {
    next(err);
  }
});

export default router;
