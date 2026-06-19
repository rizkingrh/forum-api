import CreatedComment from '../CreatedComment';

describe('CreatedComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'content',
    };

    // Action & Assert
    expect(() => new CreatedComment(payload)).toThrowError('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'content',
      owner: 1234,
    };

    // Action & Assert
    expect(() => new CreatedComment(payload)).toThrowError('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedComment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'content',
      owner: 'user-123',
    };

    // Action
    const createdComment = new CreatedComment(payload);

    // Assert
    expect(createdComment).toBeInstanceOf(CreatedComment);
    expect(createdComment.id).toEqual(payload.id);
    expect(createdComment.content).toEqual(payload.content);
    expect(createdComment.owner).toEqual(payload.owner);
  });
});