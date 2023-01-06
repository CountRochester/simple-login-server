import { z } from 'zod'

export const roleParser = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  createdAt: z.union([z.string().datetime(), z.date()]).transform(el => new Date(el)),
  updatedAt: z.union([z.string().datetime(), z.date()]).transform(el => new Date(el)),
})

export const userRoleParser = z.object({
  id: z.string().uuid(),
  createdAt: z.union([z.string(), z.date()]).transform(el => new Date(el)),
  role: roleParser,
})
