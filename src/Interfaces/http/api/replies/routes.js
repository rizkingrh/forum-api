import express from 'express';

const routes = (controller, authenticate) => {
  const router = express.Router();

  router.post('/:threadId/comments/:commentId/replies', authenticate, controller.postReply);
  router.delete('/:threadId/comments/:commentId/replies/:replyId', authenticate, controller.deleteReply);

  return router;
};

export default routes;
