import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';
import InvariantError from '../../../../Commons/exceptions/InvariantError.js';
import authMiddleware from '../authMiddleware.js';

describe('authMiddleware', () => {
  let mockTokenManager;
  let req;
  let res;
  let next;

  beforeEach(() => {
    mockTokenManager = {
      verifyAccessToken: vi.fn(),
      decodePayload: vi.fn(),
    };

    req = {
      headers: {},
    };

    res = {};

    next = vi.fn();
  });

  it('should call next with AuthenticationError when authorization header is missing', async () => {
    // Action
    await authMiddleware(mockTokenManager)(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe('Missing authentication');
  });

  it('should call next with AuthenticationError when authorization schema is invalid', async () => {
    // Arrange
    req.headers.authorization = 'Basic abc123';

    // Action
    await authMiddleware(mockTokenManager)(req, res, next);

    // Assert
    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe('invalid authentication schema');
  });

  it('should call next with error when token verification failed', async () => {
    // Arrange
    req.headers.authorization = 'Bearer invalid-token';

    mockTokenManager.verifyAccessToken.mockRejectedValue(
      new InvariantError('access token tidak valid'),
    );

    // Action
    await authMiddleware(mockTokenManager)(req, res, next);

    // Assert
    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(InvariantError);
    expect(error.message).toBe('access token tidak valid');
  });

  it('should attach payload into req.auth and call next without error', async () => {
    // Arrange
    const payload = {
      userId: 'user-123',
      username: 'dicoding',
    };

    req.headers.authorization = 'Bearer valid-token';

    mockTokenManager.verifyAccessToken.mockResolvedValue();
    mockTokenManager.decodePayload.mockResolvedValue(payload);

    // Action
    await authMiddleware(mockTokenManager)(req, res, next);

    // Assert
    expect(mockTokenManager.verifyAccessToken)
      .toHaveBeenCalledWith('valid-token');

    expect(mockTokenManager.decodePayload)
      .toHaveBeenCalledWith('valid-token');

    expect(req.auth).toEqual(payload);

    expect(next).toHaveBeenCalledWith();
  });
});