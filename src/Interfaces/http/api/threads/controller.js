import ThreadUseCase from '../../../../Applications/use_case/ThreadUseCase.js';

class ThreadsController {
  constructor(container) {
    this._container = container;
    this.postThread = this.postThread.bind(this);
    this.getThreadById = this.getThreadById.bind(this);
  }

  async postThread(req, res) {
    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const payload = {
      title: req.body.title,
      body: req.body.body,
      owner: req.auth.id,
    };
    const addedThread = await threadUseCase.execAddThread(payload);

    res.status(201).json({
      status: 'success',
      data: { addedThread },
    });
  }

  async getThreadById(req, res) {
    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const { threadId } = req.params;
    const thread = await threadUseCase.execGetThreadById(threadId);

    res.json({
      status: 'success',
      data: { thread },
    });
  }
}

export default ThreadsController;
