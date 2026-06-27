import LikeUseCase from '../../../../Applications/use_case/LikeUseCase.js';

class LikesController {
  constructor(container) {
    this._container = container;
    this.toggleLike = this.toggleLike.bind(this);
  }

  async toggleLike(req, res) {
    const likeUseCase = this._container.getInstance(LikeUseCase.name);
    const ownerId = req.auth.id;
    const { threadId, commentId } = req.params;

    await likeUseCase.execToggleLike(ownerId, threadId, commentId);

    res.json({
      status: 'success',
    });
  }
}

export default LikesController;
