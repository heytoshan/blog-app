import { Router } from 'express';
import { subscribeNewsletter } from '../controllers/newsletter.controller';

const router = Router();

router.route('/subscribe').post(subscribeNewsletter);

export default router;
