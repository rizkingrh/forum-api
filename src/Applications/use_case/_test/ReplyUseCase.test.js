import CreateReply from '../../../Domains/replies/entities/CreateReply.js';
import CreatedReply from '../../../Domains/replies/entities/CreatedReply.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import ReplyUseCase from '../ReplyUseCase.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('ReplyUseCase', () => {
  describe('execAddReply function', () => {
    it('should orchestrate the add reply action correctly', async () => {
      // Arrange
      const ownerId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const useCasePayload = {
        content: 'a reply',
      };

      const mockCreatedReply = new CreatedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: ownerId,
      });

      /** creating dependency of use case */
      const mockReplyRepository = new ReplyRepository();
      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      /** mocking needed function */
      mockThreadRepository.verifyThreadExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.verifyCommentExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.addReply = vi.fn()
        .mockImplementation(() => Promise.resolve(mockCreatedReply));

      /** creating use case instance */
      const replyUseCase = new ReplyUseCase({
        replyRepository: mockReplyRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action
      const createdReply = await replyUseCase.execAddReply(ownerId, threadId, commentId, useCasePayload);

      // Assert
      expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
      expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
      expect(createdReply).toStrictEqual(new CreatedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: ownerId,
      }));
      expect(mockReplyRepository.addReply).toBeCalledWith(
        ownerId,
        commentId,
        new CreateReply({
          content: useCasePayload.content,
        }),
      );
    });

    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const ownerId = 'user-123';
      const threadId = 'thread-999';
      const commentId = 'comment-123';
      const useCasePayload = {
        content: 'a reply',
      };

      const mockReplyRepository = new ReplyRepository();
      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      mockThreadRepository.verifyThreadExists = vi.fn()
        .mockImplementation(() => Promise.reject(new NotFoundError('thread tidak ditemukan')));
      mockCommentRepository.verifyCommentExists = vi.fn();
      mockReplyRepository.addReply = vi.fn();

      const replyUseCase = new ReplyUseCase({
        replyRepository: mockReplyRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action & Assert
      await expect(replyUseCase.execAddReply(ownerId, threadId, commentId, useCasePayload))
        .rejects
        .toThrow(NotFoundError);
      expect(mockCommentRepository.verifyCommentExists).not.toBeCalled();
      expect(mockReplyRepository.addReply).not.toBeCalled();
    });

    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const ownerId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-999';
      const useCasePayload = {
        content: 'a reply',
      };

      const mockReplyRepository = new ReplyRepository();
      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      mockThreadRepository.verifyThreadExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.verifyCommentExists = vi.fn()
        .mockImplementation(() => Promise.reject(new NotFoundError('komentar tidak ditemukan')));
      mockReplyRepository.addReply = vi.fn();

      const replyUseCase = new ReplyUseCase({
        replyRepository: mockReplyRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action & Assert
      await expect(replyUseCase.execAddReply(ownerId, threadId, commentId, useCasePayload))
        .rejects
        .toThrow(NotFoundError);
      expect(mockReplyRepository.addReply).not.toBeCalled();
    });
  });

  describe('execDeleteReply function', () => {
    it('should orchestrate the delete reply action correctly', async () => {
      // Arrange
      const ownerId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      /** creating dependency of use case */
      const mockReplyRepository = new ReplyRepository();
      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      /** mocking needed function */
      mockThreadRepository.verifyThreadExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.verifyCommentExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.verifyReplyExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.verifyReplyOwner = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.deleteReply = vi.fn()
        .mockImplementation(() => Promise.resolve());

      /** creating use case instance */
      const replyUseCase = new ReplyUseCase({
        replyRepository: mockReplyRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action
      await replyUseCase.execDeleteReply(ownerId, threadId, commentId, replyId);

      // Assert
      expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
      expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
      expect(mockReplyRepository.verifyReplyExists).toBeCalledWith(replyId);
      expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(replyId, ownerId);
      expect(mockReplyRepository.deleteReply).toBeCalledWith(replyId);
    });

    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const ownerId = 'user-123';
      const threadId = 'thread-999';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      const mockReplyRepository = new ReplyRepository();
      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      mockThreadRepository.verifyThreadExists = vi.fn()
        .mockImplementation(() => Promise.reject(new NotFoundError('thread tidak ditemukan')));
      mockCommentRepository.verifyCommentExists = vi.fn();
      mockReplyRepository.verifyReplyExists = vi.fn();
      mockReplyRepository.verifyReplyOwner = vi.fn();
      mockReplyRepository.deleteReply = vi.fn();

      const replyUseCase = new ReplyUseCase({
        replyRepository: mockReplyRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action & Assert
      await expect(replyUseCase.execDeleteReply(ownerId, threadId, commentId, replyId))
        .rejects
        .toThrow(NotFoundError);
      expect(mockCommentRepository.verifyCommentExists).not.toBeCalled();
      expect(mockReplyRepository.verifyReplyExists).not.toBeCalled();
    });

    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const ownerId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-999';
      const replyId = 'reply-123';

      const mockReplyRepository = new ReplyRepository();
      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      mockThreadRepository.verifyThreadExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.verifyCommentExists = vi.fn()
        .mockImplementation(() => Promise.reject(new NotFoundError('komentar tidak ditemukan')));
      mockReplyRepository.verifyReplyExists = vi.fn();
      mockReplyRepository.verifyReplyOwner = vi.fn();
      mockReplyRepository.deleteReply = vi.fn();

      const replyUseCase = new ReplyUseCase({
        replyRepository: mockReplyRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action & Assert
      await expect(replyUseCase.execDeleteReply(ownerId, threadId, commentId, replyId))
        .rejects
        .toThrow(NotFoundError);
      expect(mockReplyRepository.verifyReplyExists).not.toBeCalled();
    });

    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const ownerId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-999';

      const mockReplyRepository = new ReplyRepository();
      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      mockThreadRepository.verifyThreadExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.verifyCommentExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.verifyReplyExists = vi.fn()
        .mockImplementation(() => Promise.reject(new NotFoundError('balasan tidak ditemukan')));
      mockReplyRepository.verifyReplyOwner = vi.fn();
      mockReplyRepository.deleteReply = vi.fn();

      const replyUseCase = new ReplyUseCase({
        replyRepository: mockReplyRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action & Assert
      await expect(replyUseCase.execDeleteReply(ownerId, threadId, commentId, replyId))
        .rejects
        .toThrow(NotFoundError);
      expect(mockReplyRepository.verifyReplyOwner).not.toBeCalled();
      expect(mockReplyRepository.deleteReply).not.toBeCalled();
    });

    it('should throw AuthorizationError when user is not reply owner', async () => {
      // Arrange
      const ownerId = 'user-999';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      const mockReplyRepository = new ReplyRepository();
      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      mockThreadRepository.verifyThreadExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.verifyCommentExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.verifyReplyExists = vi.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.verifyReplyOwner = vi.fn()
        .mockImplementation(() => Promise.reject(new AuthorizationError('anda tidak berhak mengakses resource ini')));
      mockReplyRepository.deleteReply = vi.fn();

      const replyUseCase = new ReplyUseCase({
        replyRepository: mockReplyRepository,
        commentRepository: mockCommentRepository,
        threadRepository: mockThreadRepository,
      });

      // Action & Assert
      await expect(replyUseCase.execDeleteReply(ownerId, threadId, commentId, replyId))
        .rejects
        .toThrow(AuthorizationError);
      expect(mockReplyRepository.deleteReply).not.toBeCalled();
    });
  });
});
