import ReplyUseCase from '../../../../Applications/use_case/ReplyUseCase.js';

class RepliesController {
  constructor(container) {
    this._container = container;
    this.postReply = this.postReply.bind(this);
    this.deleteReply = this.deleteReply.bind(this);
  }

  async postReply(req, res) {
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const ownerId = req.auth.id;
    const { threadId, commentId } = req.params;
    const payload = {
      content: req.body.content,
    };
    const addedReply = await replyUseCase.execAddReply(ownerId, threadId, commentId, payload);

    res.status(201).json({
      status: 'success',
      data: { addedReply },
    });
  }

  async deleteReply(req, res) {
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const ownerId = req.auth.id;
    const { threadId, commentId, replyId } = req.params;
    await replyUseCase.execDeleteReply(ownerId, threadId, commentId, replyId);

    res.json({
      status: 'success',
    });
  }
}

export default RepliesController;
