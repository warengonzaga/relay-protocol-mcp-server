import { z } from 'zod';
import { paginationSchema, dateRangeSchema, idSchema } from './common.js';

export const jobStatusSchema = z.enum(['pending', 'running', 'completed', 'failed']);

export const createJobSchema = z.object({
  workflowId: z.string().min(1).describe('ID of the workflow to execute'),
  inputs: z.record(z.unknown()).describe('Input parameters for the workflow'),
  metadata: z.record(z.unknown()).optional().describe('Optional metadata to attach to the job'),
  callbackUrl: z.string().url().optional().describe('URL to receive job status updates'),
});

export const getJobSchema = idSchema;

export const updateJobSchema = z.object({
  id: z.string().min(1).describe('Job ID to update'),
  status: jobStatusSchema.optional().describe('New job status'),
  outputs: z.record(z.unknown()).optional().describe('Job output data'),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }).optional().describe('Error information if job failed'),
  metadata: z.record(z.unknown()).optional().describe('Updated metadata'),
});

export const queryJobsSchema = paginationSchema.merge(dateRangeSchema).extend({
  status: jobStatusSchema.optional().describe('Filter by job status'),
  workflowId: z.string().optional().describe('Filter by workflow ID'),
});

export const deleteJobSchema = idSchema;
