import { Router } from 'express';
import { createResourceController } from '../controllers/resource.controller.js';
import { validarRequest } from '../middlewares/validar-request.js';
import { createResourceModel } from '../models/resource.model.js';
import { createResourceService } from '../services/resource.service.js';

export function createResourceRouter(db, resource) {
  const router = Router();
  const model = createResourceModel(db, resource);
  const service = createResourceService(model, resource);
  const controller = createResourceController(service);

  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', validarRequest(resource.fields, resource.requiredFields), controller.create);
  router.put('/:id', validarRequest(resource.fields, resource.requiredFields), controller.update);
  router.patch('/:id', validarRequest(resource.fields), controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
