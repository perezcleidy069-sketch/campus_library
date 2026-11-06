# Campus Library API

API REST de biblioteca construida con Node.js, Express y MySQL. La organización por capas separa routers, controladores, servicios, modelos, validaciones y configuración.

## Requisitos

- Node.js 20 o superior
- MySQL 8 o compatible
- npm

## Instalación y configuración

1. Instala dependencias: `npm install`.
2. Copia `.env.example` a `.env` y configura la conexión a MySQL.
3. Ejecuta `database/schema.sql` en MySQL.
4. Inicia en desarrollo: `npm run dev`. Para producción: `npm start`.

El servidor escucha por defecto en `http://localhost:3000`. La API no incluye autenticación; limita el acceso a redes de confianza si se despliega públicamente.

## Variables de entorno

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contrasena
DB_NAME=library_campus
DB_CONNECTION_LIMIT=10
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

`CORS_ORIGINS` es una lista separada por comas. Si no se configura, se permiten todos los orígenes.

## Documentación y versión de API

- Swagger UI: `GET /api-docs` (también disponible en `/api/docs`).
- API actual: `/api/v1`.
- Los prefijos anteriores `/api/...` se mantienen como alias por compatibilidad.
- Estado: `GET /api/v1/health`.
- Rate limit global: 300 solicitudes por IP cada 15 minutos.

## Recursos CRUD

Todos estos recursos admiten `GET /api/v1/{recurso}`, `GET /:id`, `POST`, `PUT /:id`, `PATCH /:id` y `DELETE /:id`:

- `countries`: `{ "name": "México" }`
- `authors`: `{ "name": "Autora", "id_country": 1 }`
- `editorials`: `{ "name": "Editorial" }`
- `categories`: `{ "name": "Ciencia" }`
- `customers`: `{ "firstname": "Ana", "lastname": "López", "phone": "5551234567", "email": "ana@example.com", "address": "Calle 1", "estado": "ACTIVO" }`
- `cities`: `{ "name": "Ciudad" }`
- `premises`: `{ "name": "Sede central", "address": "Calle 2", "id_city": 1 }`
- `books`: `{ "name": "Libro", "year_publish": 2024, "id_category": 1, "id_author": 1, "id_editorial": 1, "stock": 5 }`

Las listas aceptan `limit` (1-100, por defecto 50) y `offset` (entero no negativo, por defecto 0). La respuesta contiene `data` y metadatos de `pagination`.

## Préstamos

- `GET /api/v1/loans` y `GET /api/v1/loans/:id`
- `POST /api/v1/loans` con `{ "id_book": 1, "id_customer": 1, "tentative_return_date": "2026-12-01 10:00:00" }`
- `PATCH /api/v1/loans/:id/return` registra la devolución y repone una unidad.
- `DELETE /api/v1/loans/:id` cancela el préstamo; si seguía activo, repone el stock.

## Ventas

- `GET /api/v1/sales` y `GET /api/v1/sales/:id`
- `POST /api/v1/sales` con `{ "id_customer": 1, "items": [{ "id_book": 1, "quantity": 2, "unit_price": 15.5 }] }`
- `DELETE /api/v1/sales/:id` cancela la venta y repone las existencias.

Los préstamos y ventas actualizan el inventario dentro de transacciones. El total de una venta se calcula en el servidor a partir de los precios enviados; la tabla de libros no define un precio.
