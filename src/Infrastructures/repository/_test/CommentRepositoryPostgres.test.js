import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import CreateComment from '../../../Domains/comments/entities/CreateComment.js';
import CreatedComment from '../../../Domains/comments/entities/CreatedComment.js';
import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist create comment', async () => {
      // Arrange
      const createComment = new CreateComment({
        content: 'Ini adalah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(createComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return created comment correctly', async () => {
      // Arrange
      const createComment = new CreateComment({
        content: 'Ini adalah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdComment = await commentRepositoryPostgres.addComment(createComment);

      // Assert
      expect(createdComment).toStrictEqual(new CreatedComment({
        id: 'comment-123',
        content: createComment.content,
        owner: 'user-123',
      }));
    });
  });

  describe('deleteComment function', () => {
    it('should delete comment correctly', async () => {
      // Arrange
      const createComment = new CreateComment({
        content: 'Ini adalah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(createComment);

      await commentRepositoryPostgres.verifyCommentExists('comment-123');

      await commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123');

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_delete).toEqual(true);
    });
  });

  describe('verifyCommentExists function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExists('comment-999'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should not throw error when comment exists', async () => {
      // Arrange
      const createComment = new CreateComment({
        content: 'Ini adalah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(createComment);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExists('comment-123'))
        .resolves
        .not
        .toThrow();
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when comment owner is different', async () => {
      // Arrange
      const createComment = new CreateComment({
        content: 'Ini adalah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(createComment);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-456'))
        .rejects
        .toThrow(AuthorizationError);
    });

    it('should not throw error when comment owner is correct', async () => {
      // Arrange
      const createComment = new CreateComment({
        content: 'Ini adalah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(createComment);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'))
        .resolves
        .not
        .toThrow();
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return empty array when thread has no comments', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toEqual([]);
    });

    it('should return comments with correct format', async () => {
      // Arrange
      const createComment = new CreateComment({
        content: 'Ini adalah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(createComment);

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0]).toHaveProperty('id');
      expect(comments[0]).toHaveProperty('username');
      expect(comments[0]).toHaveProperty('date');
      expect(comments[0]).toHaveProperty('content');
    });

    it('should return deleted comment with special message', async () => {
      // Arrange
      const createComment = new CreateComment({
        content: 'Ini adalah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(createComment);
      await commentRepositoryPostgres.deleteComment('comment-123');

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toEqual('**komentar telah dihapus**');
    });

    it('should return comments ordered by date ascending', async () => {
      // Arrange
      let counter = 0;
      const fakeIdGenerator = () => {
        counter += 1;
        return String(counter);
      };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const comment1 = new CreateComment({
        content: 'Komentar pertama',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const comment2 = new CreateComment({
        content: 'Komentar kedua',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await commentRepositoryPostgres.addComment(comment1);
      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
      await commentRepositoryPostgres.addComment(comment2);

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual('comment-1');
      expect(comments[1].id).toEqual('comment-2');
    });
  });
});