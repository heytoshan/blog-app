import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from '../controllers/auth.controller';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// Secured routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/me').get(verifyJWT, getCurrentUser);
// Alias for frontend compatibility
router.route('/current-user').get(verifyJWT, getCurrentUser);

export default router;
