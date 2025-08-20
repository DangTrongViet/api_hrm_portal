import { z } from 'zod';

export const RolesDeptQuerySchema = z.object({
  q: z.string().min(1).max(200).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

export type RolesDeptQuery = z.infer<typeof RolesDeptQuerySchema>;
