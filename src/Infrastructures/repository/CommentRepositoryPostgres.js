import CreatedComment from '../../Domains/comments/entities/CreatedComment.js';
import CommentRepository from '../../Domains/comments/CommentRepository.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(createComment) {
    const { content, threadId, owner } = createComment;
    const id = `comment-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO comments (id, thread_id, owner_id, content, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner_id AS owner',
      values: [id, threadId, owner, content, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    return new CreatedComment({ ...result.rows[0] });
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner_id = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }

  async verifyCommentExists(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT
          comments.id,
          users.username,
          comments.created_at AS date,
          CASE
            WHEN comments.is_delete = true
              THEN '**komentar telah dihapus**'
            ELSE comments.content
          END AS content
        FROM comments
        LEFT JOIN users
          ON comments.owner_id = users.id
        WHERE comments.thread_id = $1
        ORDER BY comments.created_at ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

export default CommentRepositoryPostgres;