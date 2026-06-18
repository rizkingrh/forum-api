import express from 'express';

const routes = (controller, authenticate) => {
  const router = express.Router();

  router.post('/', authenticate, controller.postThread);
  router.get('/:threadId', controller.getThreadById);

  return router;
};

export default routes;
