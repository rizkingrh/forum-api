import routes from './routes.js';
import ThreadsController from './controller.js';
import authMiddleware from '../../../../Infrastructures/http/middlewares/authMiddleware.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';

const threads = (container) => {
  const threadsController = new ThreadsController(container);

  const tokenManager = container.getInstance(AuthenticationTokenManager.name,);
  const authenticate = authMiddleware(tokenManager);

  return routes(threadsController, authenticate);
};

export default threads;
