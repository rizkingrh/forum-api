import CreateThread from '../../Domains/threads/entities/CreateThread.js';

class ThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execAddThread(useCasePayload) {
    const createThread = new CreateThread(useCasePayload);
    return this._threadRepository.addThread(createThread);
  }

  async execGetThreadById(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);
    const likes = await this._likeRepository.countLikesByThreadId(threadId);

    const likeMap = new Map(
      likes.map((like) => [like.commentId, like.likeCount]),
    );

    const replyMap = new Map();
    replies.forEach((reply) => {
      if (!replyMap.has(reply.commentId)) {
        replyMap.set(reply.commentId, []);
      }
      replyMap.get(reply.commentId).push(reply);
    });

    const commentsWithReplies = comments.map((comment) => ({
      ...comment,
      likeCount: likeMap.get(comment.id) ?? 0,
      replies: replyMap.get(comment.id) ?? [],
    }));

    return {
      ...thread,
      comments: commentsWithReplies,
    };
  }
}

export default ThreadUseCase;