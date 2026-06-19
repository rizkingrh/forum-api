import CreateComment from '../../Domains/comments/entities/CreateComment.js';

class CommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execAddComment(useCasePayload) {
    await this._threadRepository.verifyThreadExists(useCasePayload.threadId);
    const createComment = new CreateComment(useCasePayload);
    return this._commentRepository.addComment(createComment);
  }

  async execDeleteComment(useCasePayload) {
    await this._threadRepository.verifyThreadExists(useCasePayload.threadId);
    await this._commentRepository.verifyCommentExists(useCasePayload.commentId);
    await this._commentRepository.verifyCommentOwner(useCasePayload.commentId, useCasePayload.owner);
    return this._commentRepository.deleteComment(useCasePayload.commentId);
  }
}

export default CommentUseCase;