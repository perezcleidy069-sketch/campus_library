import { Router } from 'express';
import { resources } from '../config/resources.js';
import createLoanRouter from './loan.routes.js';
import createSaleRouter from './sale.routes.js';
import { createResourceRouter } from './resource.routes.js';

export default function createApiRouter(db) {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', version: 'v1' });
  });

  for (const [path, resource] of Object.entries(resources)) {
    router.use(`/${path}`, createResourceRouter(db, resource));
  }
  router.use('/loans', createLoanRouter(db));
  router.use('/sales', createSaleRouter(db));

  return router;
}
