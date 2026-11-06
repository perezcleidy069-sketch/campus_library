import { Router } from 'express';
import { createSaleController } from '../controllers/sale.controller.js';
import { createSaleModel } from '../models/sale.model.js';
import { createSaleService } from '../services/sale.service.js';

export default function createSaleRouter(db) {
  const router = Router();
  const model = createSaleModel(db);
  const service = createSaleService(db, model);
  const controller = createSaleController(service);

  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', controller.create);
  router.delete('/:id', controller.delete);

  return router;
}
