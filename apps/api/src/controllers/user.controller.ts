import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';
import { UpdateProfileInput, UpdateSettingsInput } from '../validators/user.validators';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const profile = await this.userService.getMyProfile(userId);

      if (!profile) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const requestingUserId = req.user!.userId;
      const targetUserId = req.params.userId;

      if (requestingUserId === targetUserId) {
        const profile = await this.userService.getMyProfile(targetUserId);
        if (!profile) {
          res.status(404).json({ error: 'User not found' });
          return;
        }
        res.json(profile);
        return;
      }

      const publicProfile = await this.userService.getPublicProfile(
        requestingUserId,
        targetUserId
      );

      if (!publicProfile) {
        res.status(404).json({ error: 'User not found or profile is private' });
        return;
      }

      res.json(publicProfile);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const updates: UpdateProfileInput = req.body;

      const updatedProfile = await this.userService.updateProfile(userId, updates, {
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });

      if (!updatedProfile) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getMySettings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const settings = await this.userService.getSettings(userId);

      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateMySettings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const updates: UpdateSettingsInput = req.body;

      const updatedSettings = await this.userService.updateSettings(userId, updates, {
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });

      if (!updatedSettings) {
        res.status(500).json({ error: 'Failed to update settings' });
        return;
      }

      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  deleteMyAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const deleted = await this.userService.deleteAccount(userId, {
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });

      if (!deleted) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getMySessions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const sessions = await this.userService.getActiveSessions(userId);

      const formattedSessions = sessions.map((session) => ({
        id: session.id,
        device_info: session.device_info,
        ip_address: session.ip_address,
        user_agent: session.user_agent,
        created_at: session.created_at,
        last_active_at: session.last_active_at,
        expires_at: session.expires_at,
        is_current: session.token_jti === req.user!.jti,
      }));

      res.json(formattedSessions);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  logoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const sessionId = req.params.sessionId;

      const deleted = await this.userService.logoutSession(userId, sessionId);

      if (!deleted) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      res.json({ message: 'Session logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  logoutAllSessions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const keepCurrent = req.query.keepCurrent === 'true';

      const deletedCount = await this.userService.logoutAllSessions(
        userId,
        keepCurrent ? req.user!.jti : undefined
      );

      res.json({
        message: 'Sessions logged out successfully',
        count: deletedCount,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
