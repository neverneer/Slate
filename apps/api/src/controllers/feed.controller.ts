import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { FeedService } from '../services/feed.service';

export class FeedController {
  private feedService: FeedService;

  constructor() {
    this.feedService = new FeedService();
  }

  getFeed = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const feed = await this.feedService.getFeed(userId, page, limit);
      res.json(feed);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createPost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { title, content } = req.body;

      if (!title || !content) {
        res.status(400).json({ error: 'Title and content are required' });
        return;
      }

      const post = await this.feedService.createPost(userId, title, content);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
