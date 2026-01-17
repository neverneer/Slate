import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { SubscriptionService } from '../services/subscription.service';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  getSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const subscription = await this.subscriptionService.getUserSubscription(userId);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getTiers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tiers = this.subscriptionService.getTiers();
      res.json(tiers);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  upgrade = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { tier } = req.body;

      if (!tier) {
        res.status(400).json({ error: 'Tier is required' });
        return;
      }

      const updated = await this.subscriptionService.upgradeTier(userId, tier);
      if (!updated) {
        res.status(404).json({ error: 'Failed to update subscription' });
        return;
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
