import { z } from 'zod';

export const upgradeSubscriptionSchema = z.object({
  tier: z.enum(['free', 'premium', 'developer', 'enterprise']),
});

export type UpgradeSubscriptionInput = z.infer<typeof upgradeSubscriptionSchema>;
