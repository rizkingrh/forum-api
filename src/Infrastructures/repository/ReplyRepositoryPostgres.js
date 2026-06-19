import CreatedReply from '../../Domains/replies/entities/CreatedReply.js';
import ReplyRepository from '../../Domains/replies/ReplyRepository.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(ownerId, commentId, payload) {
    const content = payload.content;
    const id = `reply-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO replies (id, comment_id, owner_id, content, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner_id AS owner',
      values: [id, commentId, ownerId, content, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    return new CreatedReply({ ...result.rows[0] });
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND owner_id = $2',
      values: [replyId, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }

  async verifyReplyExists(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `
        SELECT
          replies.id,
          replies.comment_id AS "commentId",
          users.username,
          replies.created_at AS date,
          CASE
            WHEN replies.is_delete
              THEN '**balasan telah dihapus**'
            ELSE replies.content
          END AS content
        FROM replies
        JOIN comments
          ON replies.comment_id = comments.id
        LEFT JOIN users
          ON replies.owner_id = users.id
        WHERE comments.thread_id = $1
        ORDER BY replies.created_at ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default ReplyRepositoryPostgres;