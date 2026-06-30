import LikeRepository from '../../../Domains/likes/LikeRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import LikeUseCase from '../LikeUseCase.js';

describe('LikeUseCase', () => {
  it('should orchestrate the toggle like (add) action correctly when like does not exist', async () => {
    // Arrange
    const ownerId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeExists = vi.fn()
      .mockImplementation(() => Promise.resolve(undefined));
    mockLikeRepository.addLike = vi.fn()
      .mockImplementation(() => Promise.resolve({ id: 'like-123' }));

    /** creating use case instance */
    const likeUseCase = new LikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeUseCase.execToggleLike(ownerId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
    expect(mockLikeRepository.verifyLikeExists).toBeCalledWith(ownerId, commentId);
    expect(mockLikeRepository.addLike).toBeCalledWith(ownerId, commentId);
  });

  it('should orchestrate the toggle like (delete) action correctly when like already exists', async () => {
    // Arrange
    const ownerId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeExists = vi.fn()
      .mockImplementation(() => Promise.resolve({ id: 'like-123' }));
    mockLikeRepository.deleteLike = vi.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const likeUseCase = new LikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeUseCase.execToggleLike(ownerId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
    expect(mockLikeRepository.verifyLikeExists).toBeCalledWith(ownerId, commentId);
    expect(mockLikeRepository.deleteLike).toBeCalledWith('like-123');
  });
});
