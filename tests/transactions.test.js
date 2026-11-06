import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLoanService } from '../src/services/loan.service.js';
import { createSaleService } from '../src/services/sale.service.js';

function createTransactionDb({ stock = 5 } = {}) {
  const calls = [];
  const transaction = { committed: 0, rolledBack: 0, released: 0 };
  const connection = {
    async beginTransaction() {},
    async commit() {
      transaction.committed += 1;
    },
    async rollback() {
      transaction.rolledBack += 1;
    },
    release() {
      transaction.released += 1;
    },
    async execute(sql, params = []) {
      calls.push({ sql, params });
      if (sql.includes('SELECT id, stock FROM books')) {
        return [[{ id: params[0], stock }], []];
      }
      if (sql.startsWith('INSERT INTO book_sales')) {
        return [{ insertId: 12 }, []];
      }
      if (sql.startsWith('INSERT INTO loan_books')) {
        return [{ insertId: 15 }, []];
      }
      return [{ affectedRows: 1 }, []];
    },
  };
  return {
    db: { getConnection: async () => connection },
    calls,
    transaction,
  };
}

test('sale creation persists calculated total and decrements stock transactionally', async () => {
  const { db, calls, transaction } = createTransactionDb();
  const service = createSaleService(db);

  const sale = await service.create({
    id_customer: 3,
    items: [{ id_book: 4, quantity: 2, unit_price: 15.5 }],
  });

  assert.equal(sale.total_amount, '31.00');
  assert.equal(sale.id, 12);
  assert.ok(calls.some(({ sql, params }) => sql.startsWith('UPDATE books SET stock = stock - ?')
    && params[0] === 2));
  assert.equal(transaction.committed, 1);
  assert.equal(transaction.rolledBack, 0);
  assert.equal(transaction.released, 1);
});

test('sale with insufficient stock rolls back and reports a conflict', async () => {
  const { db, transaction } = createTransactionDb({ stock: 1 });
  const service = createSaleService(db);

  await assert.rejects(
    service.create({ id_customer: 3, items: [{ id_book: 4, quantity: 2, unit_price: 15 }] }),
    { statusCode: 409 },
  );
  assert.equal(transaction.committed, 0);
  assert.equal(transaction.rolledBack, 1);
  assert.equal(transaction.released, 1);
});

test('loan creation reserves one copy and returns the created loan', async () => {
  const { db, calls, transaction } = createTransactionDb();
  const service = createLoanService(db, {});

  const loan = await service.create({ id_book: 4, id_customer: 3 });

  assert.equal(loan.id, 15);
  assert.ok(calls.some(({ sql }) => sql === 'UPDATE books SET stock = stock - 1 WHERE id = ?'));
  assert.equal(transaction.committed, 1);
  assert.equal(transaction.released, 1);
});
