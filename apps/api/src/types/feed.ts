export interface FeedItem {
  id: string;
  userId: string;
  type: 'post' | 'announcement' | 'update';
  title: string;
  content: string;
  mediaUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedResponse {
  items: FeedItem[];
  total: number;
  page: number;
  limit: number;
}
