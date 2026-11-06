import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import openApiSpec from './config/openapi.js';
import { HttpError } from './services/http-error.js';
import createApiRouter from './routers/api.routes.js';

export function createApp(db) {
  const app = express();
  const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  });

  app.disable('x-powered-by');
  app.use(cors({
    origin: allowedOrigins.length
      ? (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin))
      : '*',
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', apiLimiter);
  app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', version: 'v1' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.use('/api/v1', createApiRouter(db));
  app.use('/api', createApiRouter(db));

  app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
  app.use((error, _req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'El cuerpo JSON no es válido.' });
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un registro con esos datos.' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(409).json({ error: 'El registro relacionado indicado no existe.' });
    }
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'No se puede eliminar el registro porque está en uso.' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  });

  return app;
}
