import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuthRequest } from './auth.middleware';

export const analyticsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as AuthRequest).user?.userId;
  
  res.on('finish', () => {
    AnalyticsService.trackEvent(userId, 'request_completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode
    });
  });

  next();
};
