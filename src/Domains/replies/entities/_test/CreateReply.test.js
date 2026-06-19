import CreateReply from '../CreateReply.js';

describe('CreateReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new CreateReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 1234,
    };

    // Action & Assert
    expect(() => new CreateReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateReply entities correctly', () => {
    // Arrange
    const payload = {
      content: 'a reply',
    };

    // Action
    const createReply = new CreateReply(payload);

    // Assert
    expect(createReply).toBeInstanceOf(CreateReply);
    expect(createReply.content).toEqual(payload.content);
  });
});
