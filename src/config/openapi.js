import { resources } from './resources.js';

const paths = {
  '/health': {
    get: {
      tags: ['Estado'],
      summary: 'Verificar el estado de la API',
      responses: { 200: { description: 'API disponible' } },
    },
  },
};

for (const [path, resource] of Object.entries(resources)) {
  const tag = resource.table;
  paths[`/${path}`] = {
    get: {
      tags: [tag],
      summary: `Listar ${tag}`,
      parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 } },
        { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
      ],
      responses: { 200: { description: 'Lista paginada' }, 400: { description: 'Paginación inválida' } },
    },
    post: {
      tags: [tag],
      summary: `Crear ${tag}`,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } },
      },
      responses: { 201: { description: 'Registro creado' }, 400: { description: 'Datos inválidos' } },
    },
  };
  paths[`/${path}/{id}`] = {
    get: {
      tags: [tag],
      summary: `Obtener ${tag} por id`,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 200: { description: 'Registro encontrado' }, 404: { description: 'Registro no encontrado' } },
    },
    put: {
      tags: [tag],
      summary: `Reemplazar campos de ${tag}`,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
      responses: { 200: { description: 'Registro actualizado' }, 400: { description: 'Datos inválidos' } },
    },
    patch: {
      tags: [tag],
      summary: `Actualizar ${tag}`,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
      responses: { 200: { description: 'Registro actualizado' }, 400: { description: 'Datos inválidos' } },
    },
    delete: {
      tags: [tag],
      summary: `Eliminar ${tag}`,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { 204: { description: 'Registro eliminado' }, 409: { description: 'Registro relacionado con otros datos' } },
    },
  };
}

paths['/loans'] = {
  get: {
    tags: ['Préstamos'],
    summary: 'Listar préstamos',
    parameters: [
      { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 } },
      { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
    ],
    responses: { 200: { description: 'Lista paginada' } },
  },
  post: {
    tags: ['Préstamos'],
    summary: 'Crear préstamo y reservar existencias',
    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
    responses: { 201: { description: 'Préstamo creado' }, 409: { description: 'Sin existencias' } },
  },
};
paths['/loans/{id}'] = {
  get: {
    tags: ['Préstamos'],
    summary: 'Obtener préstamo',
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
    responses: { 200: { description: 'Préstamo encontrado' }, 404: { description: 'Préstamo no encontrado' } },
  },
  delete: {
    tags: ['Préstamos'],
    summary: 'Cancelar préstamo',
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
    responses: { 204: { description: 'Préstamo cancelado' } },
  },
};
paths['/loans/{id}/return'] = {
  patch: {
    tags: ['Préstamos'],
    summary: 'Registrar devolución',
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
    responses: { 200: { description: 'Libro devuelto' }, 409: { description: 'Préstamo ya devuelto' } },
  },
};
paths['/sales'] = {
  get: {
    tags: ['Ventas'],
    summary: 'Listar ventas',
    parameters: [
      { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 } },
      { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
    ],
    responses: { 200: { description: 'Lista paginada' } },
  },
  post: {
    tags: ['Ventas'],
    summary: 'Crear venta y descontar existencias',
    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
    responses: { 201: { description: 'Venta creada' }, 409: { description: 'Stock insuficiente' } },
  },
};
paths['/sales/{id}'] = {
  get: {
    tags: ['Ventas'],
    summary: 'Obtener venta con sus artículos',
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
    responses: { 200: { description: 'Venta encontrada' }, 404: { description: 'Venta no encontrada' } },
  },
  delete: {
    tags: ['Ventas'],
    summary: 'Cancelar venta y reponer existencias',
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
    responses: { 204: { description: 'Venta cancelada' } },
  },
};

export default {
  openapi: '3.0.3',
  info: {
    title: 'Campus Library API',
    version: '1.0.0',
    description: 'API REST para el catálogo, los clientes, los préstamos y las ventas de la biblioteca.',
  },
  servers: [{ url: '/api/v1', description: 'API versionada' }],
  tags: [
    { name: 'Estado' },
    ...Object.keys(resources).map((tag) => ({ name: resources[tag].table })),
    { name: 'Préstamos' },
    { name: 'Ventas' },
  ],
  paths,
};
