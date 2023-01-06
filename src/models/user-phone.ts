import { z } from 'zod'

export const userPhoneParser = z.object({
  id: z.string().uuid(),
  phone: z.string().min(1).max(30),
  createdAt: z.union([z.string().datetime(), z.date()]).transform(el => new Date(el)),
  updatedAt: z.union([z.string().datetime(), z.date()]).transform(el => new Date(el)),
  userId: z.string().uuid(),
})
