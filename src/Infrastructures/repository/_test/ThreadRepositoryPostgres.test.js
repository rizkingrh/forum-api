import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import CreateThread from '../../../Domains/threads/entities/CreateThread.js';
import CreatedThread from '../../../Domains/threads/entities/CreatedThread.js';
import pool from '../../database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({});
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist create thread', async () => {
      // Arrange
      const createThread = new CreateThread({
        title: 'dicoding forum',
        body: 'Ini adalah forum dicoding',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(createThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return created thread correctly', async () => {
      // Arrange
      const createThread = new CreateThread({
        title: 'dicoding forum',
        body: 'Ini adalah forum dicoding',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdThread = await threadRepositoryPostgres.addThread(createThread);

      // Assert
      expect(createdThread).toStrictEqual(new CreatedThread({
        id: 'thread-123',
        title: createThread.title,
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should return thread correctly', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding forum',
        body: 'Ini adalah forum dicoding',
        owner: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toBeDefined();
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('dicoding forum');
      expect(thread.body).toEqual('Ini adalah forum dicoding');
    });

    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-999'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should return thread with username', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding forum',
        body: 'Ini adalah forum dicoding',
        owner: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread.username).toBeDefined();
      expect(thread.username).toEqual('dicoding');
    });
  });

  describe('verifyThreadExists function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-999'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should not throw error when thread exists', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'dicoding forum',
        body: 'Ini adalah forum dicoding',
        owner: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
        .resolves
        .not
        .toThrow();
    });
  });
});