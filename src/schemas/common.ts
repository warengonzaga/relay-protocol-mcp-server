import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  fetchAll: z.boolean().default(false).describe('Automatically fetch all pages (use with caution)'),
});

export const dateRangeSchema = z.object({
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
});

export const idSchema = z.object({
  id: z.string().min(1).describe('Resource ID'),
});
