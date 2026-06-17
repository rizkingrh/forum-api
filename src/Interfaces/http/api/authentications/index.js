import AuthenticationsController from './controller.js';
import routes from './routes.js';

export default (container) => {
  const authenticationsController = new AuthenticationsController(container);

  return routes(authenticationsController);
};
