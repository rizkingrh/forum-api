import CreateThread from '../../../Domains/threads/entities/CreateThread.js';
import CreatedThread from '../../../Domains/threads/entities/CreatedThread.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';
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
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = vi.fn()
      .mockImplementation(() => Promise.resolve(mockCreatedThread));

    /** creating use case instance */
    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
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
      username: 'dicoding',
    };
    const mockComments = [
      {
        id: 'comment-123',
        content: 'a comment with multiple replies',
        username: 'dicoding',
      },
      {
        id: 'comment-456',
        content: 'a comment with no replies and no likes',
        username: 'dicoding',
      },
    ];
    // Two replies on the same comment to cover replyMap.has() false branch
    const mockReplies = [
      {
        id: 'reply-123',
        content: 'first reply',
        commentId: 'comment-123',
        username: 'dicoding',
      },
      {
        id: 'reply-456',
        content: 'second reply',
        commentId: 'comment-123',
        username: 'dicoding',
      },
    ];
    // Only one comment has likes, to cover ?? 0 fallback
    const mockLikes = [
      {
        commentId: 'comment-123',
        likeCount: 2,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = vi.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));
    mockLikeRepository.countLikesByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve(mockLikes));

    /** creating use case instance */
    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const thread = await threadUseCase.execGetThreadById(threadId);

    // Assert
    expect(thread).toStrictEqual({
      ...mockThread,
      comments: [
        {
          ...mockComments[0],
          likeCount: 2,
          replies: [mockReplies[0], mockReplies[1]],
        },
        {
          ...mockComments[1],
          likeCount: 0,    // ?? 0 fallback
          replies: [],     // ?? [] fallback
        },
      ],
    });
  });
});
