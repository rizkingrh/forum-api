import express from 'express';

const routes = (controller, authenticate) => {
  const router = express.Router();

  router.put('/:threadId/comments/:commentId/likes', authenticate, controller.toggleLike);

  return router;
};

export default routes;
