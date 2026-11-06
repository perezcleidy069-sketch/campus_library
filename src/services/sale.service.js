import { HttpError } from './http-error.js';
import { createSaleModel } from '../models/sale.model.js';
import { isPositiveInteger, parseId, parsePagination } from '../validator/resource.validacion.js';

function validateSale(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)
    || !isPositiveInteger(body.id_customer)
    || Object.keys(body).some((key) => !['id_customer', 'items'].includes(key))
    || !Array.isArray(body.items)
    || body.items.length === 0) {
    return false;
  }

  const bookIds = new Set();
  for (const item of body.items) {
    if (!item || typeof item !== 'object' || Array.isArray(item)
      || !isPositiveInteger(item.id_book)
      || !isPositiveInteger(item.quantity)
      || item.quantity > 2147483647
      || typeof item.unit_price !== 'number'
      || !Number.isFinite(item.unit_price)
      || item.unit_price <= 0
      || item.unit_price > 99999999.99
      || Object.keys(item).some((key) => !['id_book', 'quantity', 'unit_price'].includes(key))
      || bookIds.has(item.id_book)) {
      return false;
    }
    bookIds.add(item.id_book);
  }
  return true;
}

export function createSaleService(db, model = createSaleModel(db)) {
  return {
    async list(query) {
      const pagination = parsePagination(query);
      if (!pagination) {
        throw new HttpError(400, 'limit debe ser 1-100 y offset un entero no negativo.');
      }
      const [result, total] = await Promise.all([
        model.list(pagination.limit, pagination.offset),
        model.count(),
      ]);
      return { data: result[0], pagination: { ...pagination, total } };
    },
    async get(value) {
      const id = parseId(value);
      if (!id) {
        throw new HttpError(400, 'El id debe ser un entero positivo.');
      }
      const sale = await model.findById(id);
      if (!sale) {
        throw new HttpError(404, 'Venta no encontrada.');
      }
      return { ...sale, items: await model.findItems(id) };
    },
    async create(body) {
      if (!validateSale(body)) {
        throw new HttpError(400, 'Datos inválidos para crear la venta.');
      }

      const total = body.items.reduce(
        (sum, item) => sum + Math.round(item.unit_price * 100) * item.quantity,
        0,
      );
      if (!Number.isSafeInteger(total) || total > 9999999999) {
        throw new HttpError(400, 'El total excede el máximo permitido.');
      }

      let connection;
      try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        for (const item of [...body.items].sort((a, b) => a.id_book - b.id_book)) {
          const [books] = await connection.execute(
            'SELECT id, stock FROM books WHERE id = ? FOR UPDATE',
            [item.id_book],
          );
          if (books.length === 0) {
            throw new HttpError(404, `Libro ${item.id_book} no encontrado.`);
          }
          if (books[0].stock < item.quantity) {
            throw new HttpError(409, `Stock insuficiente para el libro ${item.id_book}.`);
          }
        }

        const [sale] = await connection.execute(
          'INSERT INTO book_sales (id_customer, total_amount) VALUES (?, ?)',
          [body.id_customer, (total / 100).toFixed(2)],
        );
        for (const item of body.items) {
          await connection.execute(
            'INSERT INTO book_sale_details (id_sale, id_book, quantity, unit_price) VALUES (?, ?, ?, ?)',
            [sale.insertId, item.id_book, item.quantity, item.unit_price.toFixed(2)],
          );
          await connection.execute(
            'UPDATE books SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.id_book],
          );
        }
        await connection.commit();
        return {
          id: sale.insertId,
          id_customer: body.id_customer,
          total_amount: (total / 100).toFixed(2),
          items: body.items,
        };
      } catch (error) {
        if (connection) {
          await connection.rollback();
        }
        throw error;
      } finally {
        connection?.release();
      }
    },
    async delete(value) {
      const id = parseId(value);
      if (!id) {
        throw new HttpError(400, 'El id debe ser un entero positivo.');
      }

      let connection;
      try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        const [sales] = await connection.execute('SELECT id FROM book_sales WHERE id = ? FOR UPDATE', [id]);
        if (sales.length === 0) {
          throw new HttpError(404, 'Venta no encontrada.');
        }
        const [items] = await connection.execute(
          'SELECT id_book, quantity FROM book_sale_details WHERE id_sale = ? ORDER BY id_book FOR UPDATE',
          [id],
        );
        for (const item of items) {
          await connection.execute(
            'UPDATE books SET stock = stock + ? WHERE id = ?',
            [item.quantity, item.id_book],
          );
        }
        await connection.execute('DELETE FROM book_sales WHERE id = ?', [id]);
        await connection.commit();
      } catch (error) {
        if (connection) {
          await connection.rollback();
        }
        throw error;
      } finally {
        connection?.release();
      }
    },
  };
}
