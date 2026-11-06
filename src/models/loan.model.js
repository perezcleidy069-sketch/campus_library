export function createLoanModel(db) {
  return {
    async list(limit, offset) {
      return db.execute(
        `SELECT l.*, b.name AS book_name, c.firstname, c.lastname
         FROM loan_books l
         JOIN books b ON b.id = l.id_book
         JOIN customers c ON c.id = l.id_customer
         ORDER BY l.id DESC LIMIT ? OFFSET ?`,
        [limit, offset],
      );
    },
    async count() {
      const [[row]] = await db.execute('SELECT COUNT(*) AS total FROM loan_books');
      return Number(row.total);
    },
    async findById(id) {
      const [rows] = await db.execute(
        `SELECT l.*, b.name AS book_name, c.firstname, c.lastname
         FROM loan_books l
         JOIN books b ON b.id = l.id_book
         JOIN customers c ON c.id = l.id_customer
         WHERE l.id = ?`,
        [id],
      );
      return rows[0] ?? null;
    },
  };
}
