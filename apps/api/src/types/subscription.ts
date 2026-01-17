export type SubscriptionTier = 'free' | 'premium' | 'developer' | 'enterprise';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionTierDetails {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}
