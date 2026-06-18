import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';

const authMiddleware = (tokenManager) => async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      throw new AuthenticationError('Missing authentication');
    }

    if (!authorizationHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('invalid authentication schema');
    }

    const token = authorizationHeader.split(' ')[1];
    await tokenManager.verifyAccessToken(token);
    const payload = await tokenManager.decodePayload(token);

    req.auth = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;