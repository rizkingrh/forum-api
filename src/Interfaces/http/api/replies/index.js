import routes from './routes.js';
import RepliesController from './controller.js';
import authMiddleware from '../../../../Infrastructures/http/middlewares/authMiddleware.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';

const threads = (container) => {
  const repliesController = new RepliesController(container);

  const tokenManager = container.getInstance(AuthenticationTokenManager.name,);
  const authenticate = authMiddleware(tokenManager);

  return routes(repliesController, authenticate);
};

export default threads;
