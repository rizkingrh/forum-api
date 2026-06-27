import LikeRepository from '../../Domains/likes/LikeRepository.js';

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(ownerId, commentId) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, ownerId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async deleteLike(likeId) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE id = $1',
      values: [likeId],
    };

    await this._pool.query(query);
  }

  async verifyLikeExists(ownerId, commentId) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE owner_id = $1 AND comment_id = $2',
      values: [ownerId, commentId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async countLikesByThreadId(threadId) {
    const query = {
      text: `
        SELECT
          comments.id AS "commentId",
          COUNT(comment_likes.id)::int AS "likeCount"
        FROM comments
        LEFT JOIN comment_likes
          ON comments.id = comment_likes.comment_id
        WHERE comments.thread_id = $1
        GROUP BY comments.id
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default LikeRepositoryPostgres;