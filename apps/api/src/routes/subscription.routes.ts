import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { upgradeSubscriptionSchema } from '../validators/subscription.validators';

const router = Router();
const subscriptionController = new SubscriptionController();

router.get('/', authenticateToken, subscriptionController.getSubscription);
router.get('/tiers', authenticateToken, subscriptionController.getTiers);
router.post('/upgrade', authenticateToken, validateBody(upgradeSubscriptionSchema), subscriptionController.upgrade);

export default router;
