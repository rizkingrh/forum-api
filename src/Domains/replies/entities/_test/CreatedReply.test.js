import CreatedReply from '../CreatedReply.js';

describe('CreatedReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'a reply',
    };

    // Action & Assert
    expect(() => new CreatedReply(payload)).toThrowError('CREATED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'a reply',
      owner: 1234,
    };

    // Action & Assert
    expect(() => new CreatedReply(payload)).toThrowError('CREATED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedReply entities correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'a reply',
      owner: 'user-123',
    };

    // Action
    const createdReply = new CreatedReply(payload);

    // Assert
    expect(createdReply).toBeInstanceOf(CreatedReply);
    expect(createdReply.id).toEqual(payload.id);
    expect(createdReply.content).toEqual(payload.content);
    expect(createdReply.owner).toEqual(payload.owner);
  });
});
