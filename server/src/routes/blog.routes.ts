import { Router } from 'express';
import {
  createBlog,
  getBlogs,
  getBlogBySlug,
  getTrendingBlogs,
  toggleLike,
  toggleBookmark,
  deleteBlog,
  getBlogById,
} from '../controllers/blog.controller';
import { verifyJWT } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/multer.middleware';
import commentRouter from './comment.routes';

const router = Router();

// Mount comments as nested router
router.use('/:blogId/comments', commentRouter);

router.route('/').get(getBlogs);
router.route('/trending').get(getTrendingBlogs);
router.route('/s/:slug').get(getBlogBySlug);
router.route('/id/:blogId').get(getBlogById);

// Secured routes
router.route('/create').post(verifyJWT, upload.single('featuredImage'), createBlog);
router.route('/like/:blogId').patch(verifyJWT, toggleLike);
router.route('/bookmark/:blogId').patch(verifyJWT, toggleBookmark);
router.route('/:blogId').delete(verifyJWT, deleteBlog);

export default router;
