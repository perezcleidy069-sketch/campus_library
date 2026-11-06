import { pickFields } from '../dto/resource.dto.js';
import { HttpError } from './http-error.js';
import { parseId, parsePagination } from '../validator/resource.validacion.js';

export function createResourceService(model, resource) {
  return {
    async list(query) {
      const pagination = parsePagination(query);
      if (!pagination) {
        throw new HttpError(400, 'limit debe ser 1-100 y offset un entero no negativo.');
      }
      const [data, total] = await Promise.all([
        model.list(pagination.limit, pagination.offset),
        model.count(),
      ]);
      return { data, pagination: { ...pagination, total } };
    },
    async get(value) {
      const id = parseId(value);
      if (!id) {
        throw new HttpError(400, 'El id debe ser un entero positivo.');
      }
      const record = await model.findById(id);
      if (!record) {
        throw new HttpError(404, 'Recurso no encontrado.');
      }
      return record;
    },
    async create(body) {
      return model.create(pickFields(body, resource.fields));
    },
    async update(value, body) {
      const id = parseId(value);
      if (!id) {
        throw new HttpError(400, 'El id debe ser un entero positivo.');
      }
      const resourceFields = pickFields(body, resource.fields);
      const updated = await model.update(id, resourceFields);
      const record = await model.findById(id);
      if (!record) {
        throw new HttpError(404, 'Recurso no encontrado.');
      }
      return updated ? model.findById(id) : record;
    },
    async delete(value) {
      const id = parseId(value);
      if (!id) {
        throw new HttpError(400, 'El id debe ser un entero positivo.');
      }
      if (!await model.delete(id)) {
        throw new HttpError(404, 'Recurso no encontrado.');
      }
    },
  };
}
