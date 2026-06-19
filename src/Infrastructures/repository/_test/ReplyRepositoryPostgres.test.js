import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import CreatedReply from '../../../Domains/replies/entities/CreatedReply.js';
import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist create reply', async () => {
      // Arrange
      const payload = { content: 'Ini adalah reply' };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply('user-123', 'comment-123', payload);

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return created reply correctly', async () => {
      // Arrange
      const payload = { content: 'Ini adalah reply' };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdReply = await replyRepositoryPostgres.addReply('user-123', 'comment-123', payload);

      // Assert
      expect(createdReply).toStrictEqual(new CreatedReply({
        id: 'reply-123',
        content: 'Ini adalah reply',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteReply function', () => {
    it('should delete reply correctly (soft delete)', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_delete).toEqual(true);
    });
  });

  describe('verifyReplyExists function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyExists('reply-999'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should not throw error when reply exists', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyExists('reply-123'))
        .resolves
        .not
        .toThrow();
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when reply owner is different', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', ownerId: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456'))
        .rejects
        .toThrow(AuthorizationError);
    });

    it('should not throw error when reply owner is correct', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', ownerId: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
        .resolves
        .not
        .toThrow();
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return empty array when thread has no replies', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(replies).toEqual([]);
    });

    it('should return replies with correct format', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0]).toHaveProperty('id');
      expect(replies[0]).toHaveProperty('commentId');
      expect(replies[0]).toHaveProperty('username');
      expect(replies[0]).toHaveProperty('date');
      expect(replies[0]).toHaveProperty('content');
    });

    it('should return deleted reply with special message', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].content).toEqual('**balasan telah dihapus**');
    });

    it('should return replies ordered by date ascending', async () => {
      // Arrange
      const fakeIdGenerator = (() => {
        let counter = 0;
        return () => {
          counter += 1;
          return String(counter);
        };
      })();
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.addReply('user-123', 'comment-123', { content: 'Reply pertama' });
      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
      await replyRepositoryPostgres.addReply('user-123', 'comment-123', { content: 'Reply kedua' });

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toEqual('reply-1');
      expect(replies[1].id).toEqual('reply-2');
    });
  });
});
