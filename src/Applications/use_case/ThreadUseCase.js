import CreateThread from '../../Domains/threads/entities/CreateThread.js';

class ThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execAddThread(useCasePayload) {
    const createThread = new CreateThread(useCasePayload);
    return this._threadRepository.addThread(createThread);
  }

  async execGetThreadById(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    const commentsWithReplies = comments.map((comment) => ({
      ...comment,
      replies: replies.filter(
        (reply) => reply.commentId === comment.id,
      ),
    }));

    return {
      ...thread,
      comments: commentsWithReplies,
    };
  }
}

export default ThreadUseCase;