import { z } from 'zod'
import { userModel } from './user'

export const tokenParser = z.object({
  user: userModel
})
