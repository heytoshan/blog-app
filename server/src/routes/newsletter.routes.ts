import { Router } from 'express';
import { subscribeNewsletter } from '../controllers/newsletter.controller';

import { verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

router.route('/subscribe').post(verifyJWT, subscribeNewsletter);

export default router;
