import routes from './routes.js';
import LikesController from './controller.js';
import authMiddleware from '../../../../Infrastructures/http/middlewares/authMiddleware.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';

const likes = (container) => {
  const likesController = new LikesController(container);

  const tokenManager = container.getInstance(AuthenticationTokenManager.name,);
  const authenticate = authMiddleware(tokenManager);

  return routes(likesController, authenticate);
};

export default likes;
