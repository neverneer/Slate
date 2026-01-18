import { FeedModel } from '../models/feed.model';
import { FeedItem, FeedResponse } from '../types/feed';

export class FeedService {
  async getFeed(userId: string, page: number = 1, limit: number = 20): Promise<FeedResponse> {
    const offset = (page - 1) * limit;
    const { items, total } = await FeedModel.getFeedForUser(userId, limit, offset);
    
    // If feed is empty, provide some welcome content
    if (items.length === 0) {
      return {
        items: [
          {
            id: 'welcome-1',
            userId,
            type: 'announcement',
            title: 'Welcome to Slate!',
            content: 'We are glad to have you here. This is your unified feed where you will see updates from all your Slate services.',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: 1,
        page,
        limit
      };
    }

    return {
      items,
      total,
      page,
      limit
    };
  }

  async createPost(userId: string, title: string, content: string): Promise<FeedItem> {
    return FeedModel.create({
      userId,
      type: 'post',
      title,
      content
    });
  }
}
