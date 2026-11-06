import 'dotenv/config';
import pool from './src/config/db.js';
import { createApp } from './src/app.js';

const port = Number(process.env.PORT || 3000);
const app = createApp(pool);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe ser un entero entre 1 y 65535.');
}

const server = app.listen(port, () => {
  console.log(`Campus Library API escuchando en el puerto ${port}`);
});

function shutdown() {
  server.close(() => {
    pool.end().then(() => process.exit(0)).catch((error) => {
      console.error('Error closing database pool:', error);
      process.exit(1);
    });
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
