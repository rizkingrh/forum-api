import CreateThread from '../../Domains/threads/entities/CreateThread.js';

class ThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execAddThread(useCasePayload) {
    const createThread = new CreateThread(useCasePayload);
    return this._threadRepository.addThread(createThread);
  }

  async execGetThreadById(threadId) {
    return this._threadRepository.getThreadById(threadId);
  }
}

export default ThreadUseCase;