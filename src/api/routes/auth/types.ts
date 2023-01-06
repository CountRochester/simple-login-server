import { z } from 'zod'
import { RequestGenericInterface } from 'fastify'
import { buildJsonSchemas } from 'fastify-zod'
import { userModel } from '@/models'

export const loginBody = z.object({
  username: z.string().min(5).max(255),
  password: z.string().min(5).max(255),
})

export const loginResponse = z.object({
  status: z.enum(['success', 'error']),
  message: z.string().optional(),
})

export const logoutResponse = z.object({
  status: z.enum(['success', 'error']),
  message: z.string().optional(),
})

export const { $ref, schemas: userRolesSchemas } = buildJsonSchemas({
  userModel,
  loginBody,
  loginResponse,
  logoutResponse
})

export type LoginBody = z.infer<typeof loginBody>
export type LoginResponse = z.infer<typeof loginResponse>
export type LogoutResponse = z.infer<typeof logoutResponse>
export type UserResponse = z.infer<typeof userModel>

export interface LoginConfig extends RequestGenericInterface {
  Body: LoginBody
}
