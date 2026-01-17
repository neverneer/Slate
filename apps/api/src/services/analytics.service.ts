import { logger } from '../utils/logger';

export class AnalyticsService {
  static trackEvent(userId: string | undefined, event: string, properties: any = {}): void {
    logger.info('Analytics Event', {
      userId,
      event,
      properties,
      timestamp: new Date().toISOString()
    });
  }
}
