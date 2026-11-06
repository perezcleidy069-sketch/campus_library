export function createResourceModel(db, { table, fields, orderBy = 'id' }) {
  const columns = ['id', ...Object.keys(fields)].map((field) => `\`${field}\``).join(', ');

  return {
    async list(limit, offset) {
      const [rows] = await db.execute(
        `SELECT ${columns} FROM \`${table}\` ORDER BY \`${orderBy}\` LIMIT ? OFFSET ?`,
        [limit, offset],
      );
      return rows;
    },
    async count() {
      const [[row]] = await db.execute(`SELECT COUNT(*) AS total FROM \`${table}\``);
      return Number(row.total);
    },
    async findById(id) {
      const [rows] = await db.execute(`SELECT ${columns} FROM \`${table}\` WHERE id = ?`, [id]);
      return rows[0] ?? null;
    },
    async create(resource) {
      const names = Object.keys(resource);
      const [result] = await db.execute(
        `INSERT INTO \`${table}\` (${names.map((field) => `\`${field}\``).join(', ')})
         VALUES (${names.map(() => '?').join(', ')})`,
        names.map((field) => resource[field]),
      );
      return this.findById(result.insertId);
    },
    async update(id, resource) {
      const names = Object.keys(resource);
      const [result] = await db.execute(
        `UPDATE \`${table}\` SET ${names.map((field) => `\`${field}\` = ?`).join(', ')} WHERE id = ?`,
        [...names.map((field) => resource[field]), id],
      );
      return result.affectedRows > 0;
    },
    async delete(id) {
      const [result] = await db.execute(`DELETE FROM \`${table}\` WHERE id = ?`, [id]);
      return result.affectedRows > 0;
    },
  };
}
