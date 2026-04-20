import { Router } from 'express';
import { addComment, getComments, deleteComment, toggleCommentLike } from '../controllers/comment.controller';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true }); // mergeParams to access :blogId

router.route('/').get(getComments).post(verifyJWT, addComment);
router.route('/:commentId').delete(verifyJWT, deleteComment);
router.route('/:commentId/like').patch(verifyJWT, toggleCommentLike);

export default router;
