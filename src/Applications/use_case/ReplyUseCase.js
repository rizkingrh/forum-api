import CreateReply from '../../Domains/replies/entities/CreateReply.js';

class ReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execAddReply(ownerId, threadId, commentId, useCasePayload) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);
    const createReplyValidate = new CreateReply(useCasePayload);
    return this._replyRepository.addReply(ownerId, commentId, createReplyValidate);
  }

  async execDeleteReply(ownerId, threadId, commentId, replyId) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);
    await this._replyRepository.verifyReplyExists(replyId);
    await this._replyRepository.verifyReplyOwner(replyId, ownerId);
    return this._replyRepository.deleteReply(replyId);
  }
}

export default ReplyUseCase;