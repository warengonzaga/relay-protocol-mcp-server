import { z } from 'zod';
import { paginationSchema, idSchema } from './common.js';

export const callbackEventSchema = z.enum([
  'job.created',
  'job.started',
  'job.completed',
  'job.failed',
]);

export const registerCallbackSchema = z.object({
  url: z.string().url().describe('Webhook URL to receive events'),
  events: z.array(callbackEventSchema).min(1).describe('Events to subscribe to'),
  headers: z.record(z.string()).optional().describe('Custom headers to include in webhook requests'),
});

export const listCallbacksSchema = paginationSchema;

export const getCallbackSchema = idSchema;

export const updateCallbackSchema = z.object({
  id: z.string().min(1).describe('Callback ID to update'),
  url: z.string().url().optional().describe('Updated webhook URL'),
  events: z.array(callbackEventSchema).min(1).optional().describe('Updated event subscriptions'),
  headers: z.record(z.string()).optional().describe('Updated custom headers'),
  active: z.boolean().optional().describe('Enable or disable the callback'),
});

export const deleteCallbackSchema = idSchema;
