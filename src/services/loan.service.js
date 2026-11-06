import { HttpError } from './http-error.js';
import {
  isOptionalDate,
  isPositiveInteger,
  normalizeDateTime,
  parseId,
  parsePagination,
} from '../validator/resource.validacion.js';

function rollback(connection) {
  return connection.rollback();
}

export function createLoanService(db, model) {
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
      const loan = await model.findById(id);
      if (!loan) {
        throw new HttpError(404, 'Préstamo no encontrado.');
      }
      return loan;
    },
    async create(body) {
      if (!isPositiveInteger(body.id_book) || !isPositiveInteger(body.id_customer)
        || (Object.hasOwn(body, 'tentative_return_date') && !isOptionalDate(body.tentative_return_date))
        || Object.keys(body).some((key) => !['id_book', 'id_customer', 'tentative_return_date'].includes(key))) {
        throw new HttpError(400, 'Datos inválidos para crear el préstamo.');
      }

      let connection;
      try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        const [books] = await connection.execute(
          'SELECT id, stock FROM books WHERE id = ? FOR UPDATE',
          [body.id_book],
        );
        if (books.length === 0) {
          throw new HttpError(404, 'Libro no encontrado.');
        }
        if (books[0].stock < 1) {
          throw new HttpError(409, 'No hay ejemplares disponibles para préstamo.');
        }

        const [result] = await connection.execute(
          'INSERT INTO loan_books (id_book, id_customer, tentative_return_date) VALUES (?, ?, ?)',
          [body.id_book, body.id_customer, normalizeDateTime(body.tentative_return_date)],
        );
        await connection.execute('UPDATE books SET stock = stock - 1 WHERE id = ?', [body.id_book]);
        await connection.commit();
        return { id: result.insertId, ...body, return_date: null };
      } catch (error) {
        if (connection) {
          await rollback(connection);
        }
        throw error;
      } finally {
        connection?.release();
      }
    },
    async returnBook(value) {
      const id = parseId(value);
      if (!id) {
        throw new HttpError(400, 'El id debe ser un entero positivo.');
      }

      let connection;
      try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        const [loans] = await connection.execute(
          'SELECT id, id_book, return_date FROM loan_books WHERE id = ? FOR UPDATE',
          [id],
        );
        if (loans.length === 0) {
          throw new HttpError(404, 'Préstamo no encontrado.');
        }
        if (loans[0].return_date) {
          throw new HttpError(409, 'Este préstamo ya fue devuelto.');
        }
        await connection.execute('UPDATE loan_books SET return_date = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        await connection.execute('UPDATE books SET stock = stock + 1 WHERE id = ?', [loans[0].id_book]);
        await connection.commit();
        return 'Libro devuelto correctamente.';
      } catch (error) {
        if (connection) {
          await rollback(connection);
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
        const [loans] = await connection.execute(
          'SELECT id, id_book, return_date FROM loan_books WHERE id = ? FOR UPDATE',
          [id],
        );
        if (loans.length === 0) {
          throw new HttpError(404, 'Préstamo no encontrado.');
        }
        if (!loans[0].return_date) {
          await connection.execute('UPDATE books SET stock = stock + 1 WHERE id = ?', [loans[0].id_book]);
        }
        await connection.execute('DELETE FROM loan_books WHERE id = ?', [id]);
        await connection.commit();
      } catch (error) {
        if (connection) {
          await rollback(connection);
        }
        throw error;
      } finally {
        connection?.release();
      }
    },
  };
}
