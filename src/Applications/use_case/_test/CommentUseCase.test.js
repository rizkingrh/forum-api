import CreateComment from '../../../Domains/comments/entities/CreateComment.js';
import CreatedComment from '../../../Domains/comments/entities/CreatedComment.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import CommentUseCase from '../CommentUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('CommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Ini adalah komentar pedas',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockCreatedComment = new CreatedComment({
      id: 'thread-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = vi.fn()
      .mockImplementation(() => Promise.resolve(mockCreatedComment));

    /** creating use case instance */
    const commentUseCase = new CommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdComment = await commentUseCase.execAddComment(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
    expect(createdComment).toStrictEqual(new CreatedComment({
      id: 'thread-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
    expect(mockCommentRepository.addComment).toBeCalledWith(new CreateComment({
      threadId: useCasePayload.threadId,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
  });

  describe('execDeleteComment function', () => {
    it('should orchestrate the delete comment action correctly', async () => {
      // Arrange
      const useCasePayload = {
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      };

      /** creating dependency of use case */
      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      /** mocking needed function */
      mockThreadRepository.verifyThreadExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.verifyCommentExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.verifyCommentOwner = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.deleteComment = vi.fn()
        .mockImplementation(() => Promise.resolve());

      /** creating use case instance */
      const commentUseCase = new CommentUseCase({
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action
      await commentUseCase.execDeleteComment(useCasePayload);

      // Assert
      expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
      expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(useCasePayload.commentId);
      expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
      expect(mockCommentRepository.deleteComment).toBeCalledWith(useCasePayload.commentId);
    });

    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const useCasePayload = {
        commentId: 'comment-123',
        threadId: 'thread-999',
        owner: 'user-123',
      };

      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      mockThreadRepository.verifyThreadExists = vi.fn()
        .mockImplementation(() => Promise.reject(new NotFoundError('thread tidak ditemukan')));
      mockCommentRepository.verifyCommentExists = vi.fn();
      mockCommentRepository.verifyCommentOwner = vi.fn();
      mockCommentRepository.deleteComment = vi.fn();

      const commentUseCase = new CommentUseCase({
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action & Assert
      await expect(commentUseCase.execDeleteComment(useCasePayload))
        .rejects
        .toThrow(NotFoundError);
      expect(mockCommentRepository.verifyCommentExists).not.toBeCalled();
    });

    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const useCasePayload = {
        commentId: 'comment-999',
        threadId: 'thread-123',
        owner: 'user-123',
      };

      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      mockThreadRepository.verifyThreadExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.verifyCommentExists = vi.fn()
        .mockImplementation(() => Promise.reject(new NotFoundError('komentar tidak ditemukan')));
      mockCommentRepository.verifyCommentOwner = vi.fn();
      mockCommentRepository.deleteComment = vi.fn();

      const commentUseCase = new CommentUseCase({
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action & Assert
      await expect(commentUseCase.execDeleteComment(useCasePayload))
        .rejects
        .toThrow(NotFoundError);
      expect(mockCommentRepository.verifyCommentOwner).not.toBeCalled();
    });

    it('should throw AuthorizationError when user is not comment owner', async () => {
      // Arrange
      const useCasePayload = {
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-999',
      };

      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      mockThreadRepository.verifyThreadExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.verifyCommentExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.verifyCommentOwner = vi.fn()
        .mockImplementation(() => Promise.reject(new AuthorizationError('anda tidak berhak mengakses resource ini')));
      mockCommentRepository.deleteComment = vi.fn();

      const commentUseCase = new CommentUseCase({
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action & Assert
      await expect(commentUseCase.execDeleteComment(useCasePayload))
        .rejects
        .toThrow(AuthorizationError);
      expect(mockCommentRepository.deleteComment).not.toBeCalled();
    });
  });
});
