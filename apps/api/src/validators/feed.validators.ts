import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
