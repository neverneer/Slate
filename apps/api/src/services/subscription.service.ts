import { SubscriptionModel } from '../models/subscription.model';
import { Subscription, SubscriptionTier, SubscriptionTierDetails } from '../types/subscription';

export class SubscriptionService {
  private readonly tiers: SubscriptionTierDetails[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: ['Core identity', 'Basic communication', '1GB Vault storage']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      currency: 'USD',
      interval: 'month',
      features: ['All Free features', 'Slate Stream access', '100GB Vault storage', 'Ad-free experience']
    },
    {
      id: 'developer',
      name: 'Developer',
      price: 49.99,
      currency: 'USD',
      interval: 'month',
      features: ['All Premium features', 'Slate Code tools', 'Priority support', 'API access']
    }
  ];

  async getUserSubscription(userId: string): Promise<Subscription> {
    let subscription = await SubscriptionModel.getByUserId(userId);
    
    if (!subscription) {
      // Default to free tier
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 10); // Far in the future
      
      subscription = await SubscriptionModel.create({
        userId,
        tier: 'free',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: false
      });
    }

    return subscription;
  }

  async upgradeTier(userId: string, tier: SubscriptionTier): Promise<Subscription | null> {
    return SubscriptionModel.updateTier(userId, tier);
  }

  getTiers(): SubscriptionTierDetails[] {
    return this.tiers;
  }
}
