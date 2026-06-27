/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const LikesTableTestHelper = {
  async addLike({
    id = 'like-123', commentId = 'comment-123', ownerId = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3)',
      values: [id, commentId, ownerId],
    };

    await pool.query(query);
  },

  async findLikeById(id) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE comment_likes CASCADE');
  },
};

export default LikesTableTestHelper;
