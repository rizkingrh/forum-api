import CreateThread from '../../../Domains/threads/entities/CreateThread.js';
import CreatedThread from '../../../Domains/threads/entities/CreatedThread.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadUseCase from '../ThreadUseCase.js';

describe('ThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Dicoding Forum',
      body: 'This is a forum thread',
      owner: 'user-123',
    };

    const mockCreatedThread = new CreatedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = vi.fn()
      .mockImplementation(() => Promise.resolve(mockCreatedThread));

    /** creating use case instance */
    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdThread = await threadUseCase.execAddThread(useCasePayload);

    // Assert
    expect(createdThread).toStrictEqual(new CreatedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    }));
    expect(mockThreadRepository.addThread).toBeCalledWith(new CreateThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    }));
  });

  it('should orchestrate the get thread by id action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const mockThread = {
      id: 'thread-123',
      title: 'Dicoding Forum',
      body: 'This is a forum thread',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = vi.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    /** creating use case instance */
    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const thread = await threadUseCase.execGetThreadById(threadId);

    // Assert
    expect(thread).toBeDefined();
    expect(thread).not.toEqual({});
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
  });
});
