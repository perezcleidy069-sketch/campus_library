import { Router } from 'express';
import { createLoanController } from '../controllers/loan.controller.js';
import { createLoanModel } from '../models/loan.model.js';
import { createLoanService } from '../services/loan.service.js';
import { isOptionalDate, isPositiveInteger } from '../validator/resource.validacion.js';

const fields = {
  id_book: isPositiveInteger,
  id_customer: isPositiveInteger,
  tentative_return_date: isOptionalDate,
};

function validateCreate(req, res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)
    || !Object.hasOwn(req.body, 'id_book')
    || !Object.hasOwn(req.body, 'id_customer')
    || Object.keys(req.body).some((key) => !Object.hasOwn(fields, key))
    || Object.entries(req.body).some(([key, value]) => !fields[key](value))) {
    return res.status(400).json({ error: 'Datos inválidos para crear el préstamo.' });
  }
  next();
}

export default function createLoanRouter(db) {
  const router = Router();
  const model = createLoanModel(db);
  const service = createLoanService(db, model);
  const controller = createLoanController(service);

  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', validateCreate, controller.create);
  router.patch('/:id/return', controller.returnBook);
  router.delete('/:id', controller.delete);

  return router;
}
