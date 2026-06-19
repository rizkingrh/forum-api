import pool from '../src/Infrastructures/database/postgres/pool.js';

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', threadId = 'thread-123', content = 'Ini adalah comment baru', ownerId = 'user-123',
  }) {
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO comments (id, thread_id, owner_id, content, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, ownerId, content, createdAt, updatedAt],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE comments CASCADE');
  },
};

export default CommentsTableTestHelper;