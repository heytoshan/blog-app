import { Router } from 'express';
import { updateProfile, toggleFollow, getUserProfile, getTopWriters, getBookmarkedBlogs, getAllUsers, deleteUser } from '../controllers/user.controller';
import { verifyJWT, authorizeRole } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/multer.middleware';

const router = Router();

router.route('/profile/:username').get(getUserProfile);
router.route('/top-writers').get(getTopWriters);

// Secured routes
router.route('/update-profile').patch(verifyJWT, upload.single('avatar'), updateProfile);
router.route('/follow/:targetUserId').post(verifyJWT, toggleFollow);
router.route('/bookmarks').get(verifyJWT, getBookmarkedBlogs);

// Admin routes
router.route('/').get(verifyJWT, authorizeRole('admin'), getAllUsers);
router.route('/:userId').delete(verifyJWT, authorizeRole('admin'), deleteUser);

export default router;
