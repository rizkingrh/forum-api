import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist like correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike('user-123', 'comment-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(1);
    });

    it('should return added like correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedLike = await likeRepositoryPostgres.addLike('user-123', 'comment-123');

      // Assert
      expect(addedLike).toStrictEqual({ id: 'like-123' });
    });
  });

  describe('deleteLike function', () => {
    it('should delete like correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      await likeRepositoryPostgres.addLike('user-123', 'comment-123');

      // Action
      await likeRepositoryPostgres.deleteLike('like-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('verifyLikeExists function', () => {
    it('should return undefined when like does not exist', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => {});

      // Action
      const result = await likeRepositoryPostgres.verifyLikeExists('user-123', 'comment-123');

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return like id when like exists', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      await likeRepositoryPostgres.addLike('user-123', 'comment-123');

      // Action
      const result = await likeRepositoryPostgres.verifyLikeExists('user-123', 'comment-123');

      // Assert
      expect(result).toStrictEqual({ id: 'like-123' });
    });
  });

  describe('countLikesByThreadId function', () => {
    it('should return like counts for comments in a thread', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      await likeRepositoryPostgres.addLike('user-123', 'comment-123');

      // Action
      const likeCounts = await likeRepositoryPostgres.countLikesByThreadId('thread-123');

      // Assert
      expect(likeCounts).toHaveLength(1);
      expect(likeCounts[0]).toStrictEqual({
        commentId: 'comment-123',
        likeCount: 1,
      });
    });

    it('should return 0 likeCount when comment has no likes', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => {});

      // Action
      const likeCounts = await likeRepositoryPostgres.countLikesByThreadId('thread-123');

      // Assert
      expect(likeCounts).toHaveLength(1);
      expect(likeCounts[0]).toStrictEqual({
        commentId: 'comment-123',
        likeCount: 0,
      });
    });

    it('should return correct like counts for multiple comments', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await CommentsTableTestHelper.addComment({ id: 'comment-456' });

      let counter = 0;
      const fakeIdGenerator = () => {
        counter += 1;
        return String(counter);
      };
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // 2 likes on comment-123, 1 like on comment-456
      await likeRepositoryPostgres.addLike('user-123', 'comment-123');
      await likeRepositoryPostgres.addLike('user-456', 'comment-123');
      await likeRepositoryPostgres.addLike('user-123', 'comment-456');

      // Action
      const likeCounts = await likeRepositoryPostgres.countLikesByThreadId('thread-123');

      // Assert
      expect(likeCounts).toHaveLength(2);

      const comment123Likes = likeCounts.find((lc) => lc.commentId === 'comment-123');
      const comment456Likes = likeCounts.find((lc) => lc.commentId === 'comment-456');

      expect(comment123Likes.likeCount).toEqual(2);
      expect(comment456Likes.likeCount).toEqual(1);
    });

    it('should return empty array when thread has no comments', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-456' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => {});

      // Action
      const likeCounts = await likeRepositoryPostgres.countLikesByThreadId('thread-456');

      // Assert
      expect(likeCounts).toEqual([]);
    });
  });
});
