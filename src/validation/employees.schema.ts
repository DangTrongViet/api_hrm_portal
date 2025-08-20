import { z } from 'zod';

/** common */
const Status = z.enum(['active', 'inactive']);
const SortKey = z.enum([
  'full_name',
  'department',
  'status',
  'createdAt',
  'updatedAt',
]);
const Dir = z.enum(['asc', 'desc']);

/** body: create */
export const createEmployeeSchema = z.object({
  full_name: z.string().min(1, 'Vui lòng nhập họ tên'),
  email: z
    .string()
    .email('Email không hợp lệ')
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  phone: z.string().max(20).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  status: Status.default('active').optional(),
});

/** body: update (partial) */
export const updateEmployeeSchema = z.object({
  full_name: z.string().min(1).optional(),
  email: z
    .string()
    .email('Email không hợp lệ')
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  phone: z.string().max(20).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  status: Status.optional(),
});

/** query: list */
export const listQuerySchema = z.object({
  q: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  status: Status.optional(),
  sort: SortKey.default('full_name').optional(),
  dir: Dir.default('asc').optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).default(10).optional(),
});

/** params: /:id */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** query: ?hard=true  (nếu bạn vẫn truyền) */
export const hardQuerySchema = z.object({
  hard: z.coerce.boolean().optional(),
});
