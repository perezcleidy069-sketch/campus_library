export function createSaleModel(db) {
  return {
    async list(limit, offset) {
      return db.execute(
        `SELECT s.*, c.firstname, c.lastname
         FROM book_sales s
         JOIN customers c ON c.id = s.id_customer
         ORDER BY s.id DESC LIMIT ? OFFSET ?`,
        [limit, offset],
      );
    },
    async count() {
      const [[row]] = await db.execute('SELECT COUNT(*) AS total FROM book_sales');
      return Number(row.total);
    },
    async findById(id) {
      const [rows] = await db.execute(
        `SELECT s.*, c.firstname, c.lastname
         FROM book_sales s
         JOIN customers c ON c.id = s.id_customer
         WHERE s.id = ?`,
        [id],
      );
      return rows[0] ?? null;
    },
    async findItems(id) {
      const [rows] = await db.execute(
        `SELECT d.*, b.name AS book_name
         FROM book_sale_details d
         JOIN books b ON b.id = d.id_book
         WHERE d.id_sale = ? ORDER BY d.id`,
        [id],
      );
      return rows;
    },
  };
}
