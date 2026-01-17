import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import {
  updateProfileSchema,
  updateSettingsSchema,
  userIdParamSchema,
} from '../validators/user.validators';

const router = Router();
const userController = new UserController();

router.get('/me', authenticateToken, userController.getMyProfile);

router.get(
  '/:userId',
  authenticateToken,
  validateParams(userIdParamSchema),
  userController.getUserProfile
);

router.put(
  '/me',
  authenticateToken,
  validateBody(updateProfileSchema),
  userController.updateMyProfile
);

router.get('/me/settings', authenticateToken, userController.getMySettings);

router.put(
  '/me/settings',
  authenticateToken,
  validateBody(updateSettingsSchema),
  userController.updateMySettings
);

router.delete('/me', authenticateToken, userController.deleteMyAccount);

router.get('/me/sessions', authenticateToken, userController.getMySessions);

router.delete(
  '/me/sessions/:sessionId',
  authenticateToken,
  userController.logoutSession
);

router.delete('/me/sessions', authenticateToken, userController.logoutAllSessions);

export default router;
