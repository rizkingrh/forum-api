import CreateComment from '../CreateComment.js';

describe('CreateComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'content',
    };

    // Action & Assert
    expect(() => new CreateComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'content',
      threadId: 1234,
      owner: true,
    };

    // Action & Assert
    expect(() => new CreateComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateComment entities correctly', () => {
    // Arrange
    const payload = {
      content: 'content',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Action
    const createComment = new CreateComment(payload);

    // Assert
    expect(createComment).toBeInstanceOf(CreateComment);
    expect(createComment.content).toEqual(payload.content);
    expect(createComment.threadId).toEqual(payload.threadId);
    expect(createComment.owner).toEqual(payload.owner);
  });
});