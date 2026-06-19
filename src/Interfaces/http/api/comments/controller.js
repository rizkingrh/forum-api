import CommentUseCase from '../../../../Applications/use_case/CommentUseCase.js';

class CommentsController {
  constructor(container) {
    this._container = container;
    this.postComment = this.postComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }

  async postComment(req, res) {
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const payload = {
      threadId: req.params.threadId,
      content: req.body.content,
      owner: req.auth.id,
    };
    const addedComment = await commentUseCase.execAddComment(payload);

    res.status(201).json({
      status: 'success',
      data: { addedComment },
    });
  }

  async deleteComment(req, res) {
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const payload = {
      threadId: req.params.threadId,
      commentId: req.params.commentId,
      owner: req.auth.id,
    };
    await commentUseCase.execDeleteComment(payload);

    res.json({
      status: 'success',
    });
  }
}

export default CommentsController;
