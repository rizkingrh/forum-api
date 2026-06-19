import express from 'express';

const routes = (controller, authenticate) => {
  const router = express.Router();

  router.post('/:threadId/comments', authenticate, controller.postComment);
  router.delete('/:threadId/comments/:commentId', authenticate, controller.deleteComment);

  return router;
};

export default routes;
