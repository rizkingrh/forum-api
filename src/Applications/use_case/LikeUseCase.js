class LikeUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execToggleLike(ownerId, threadId, commentId) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);

    const like = await this._likeRepository.verifyLikeExists(ownerId, commentId);
    if (like) {
      await this._likeRepository.deleteLike(like.id);
    } else {
      await this._likeRepository.addLike(ownerId, commentId);
    }
  }
}

export default LikeUseCase;