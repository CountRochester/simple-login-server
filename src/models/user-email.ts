import { z } from 'zod'

export const userEmailParser = z.object({
  id: z.string().uuid(),
  email: z.string().min(1).max(150),
  createdAt: z.union([z.string().datetime(), z.date()]).transform(el => new Date(el)),
  updatedAt: z.union([z.string().datetime(), z.date()]).transform(el => new Date(el)),
  userId: z.string().uuid(),
})
