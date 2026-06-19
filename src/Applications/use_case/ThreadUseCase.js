import CreateThread from '../../Domains/threads/entities/CreateThread.js';

class ThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execAddThread(useCasePayload) {
    const createThread = new CreateThread(useCasePayload);
    return this._threadRepository.addThread(createThread);
  }

  async execGetThreadById(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    return {
      ...thread,
      comments,
    };
  }
}

export default ThreadUseCase;