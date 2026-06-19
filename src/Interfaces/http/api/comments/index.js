import routes from './routes.js';
import CommentsController from './controller.js';
import authMiddleware from '../../../../Infrastructures/http/middlewares/authMiddleware.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';

const threads = (container) => {
  const commentsController = new CommentsController(container);

  const tokenManager = container.getInstance(AuthenticationTokenManager.name,);
  const authenticate = authMiddleware(tokenManager);

  return routes(commentsController, authenticate);
};

export default threads;
