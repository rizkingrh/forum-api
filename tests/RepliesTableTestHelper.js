/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123', commentId = 'comment-123', content = 'Ini adalah reply comment', ownerId = 'user-123',
  }) {
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO replies (id, comment_id, owner_id, content, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, commentId, ownerId, content, createdAt, updatedAt],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE replies CASCADE');
  },
};

export default RepliesTableTestHelper;