import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { createPostSchema } from '../validators/feed.validators';

const router = Router();
const feedController = new FeedController();

router.get('/', authenticateToken, feedController.getFeed);
router.post('/', authenticateToken, validateBody(createPostSchema), feedController.createPost);

export default router;
