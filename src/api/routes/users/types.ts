import { z } from 'zod'
import { RequestGenericInterface } from 'fastify'
import { buildJsonSchemas } from 'fastify-zod'
import { userParser, userModelDTO } from '@/models'
import { getPaginatedList } from '@/common/helpers'
import { API_PAGESIZE } from '@/config/api-config'

const getUsersQuery = z.object({
  id: z.string().uuid().optional(),
  id_not: z.string().uuid().optional(),
  id_in: z.array(z.string().uuid()).optional(),
  id_notIn: z.array(z.string().uuid()).optional(),

  firstName: z.union([z.string().max(255), z.null()]).optional(),
  firstName_not: z.union([z.string().max(255), z.null()]).optional(),
  firstName_contains: z.string().max(255).optional(),
  firstName_endsWith: z.string().max(255).optional(),
  firstName_startsWith: z.string().max(255).optional(),
  firstName_in: z.array(z.string().max(255)).optional(),
  firstName_notIn: z.array(z.string().max(255)).optional(),

  lastName: z.string().max(255).optional(),
  lastName_not: z.string().max(255).optional(),
  lastName_contains: z.string().max(255).optional(),
  lastName_endsWith: z.string().max(255).optional(),
  lastName_startsWith: z.string().max(255).optional(),
  lastName_in: z.array(z.string().max(255)).optional(),
  lastName_notIn: z.array(z.string().max(255)).optional(),

  middleName: z.union([z.string().max(255), z.null()]).optional(),
  middleName_not: z.union([z.string().max(255), z.null()]).optional(),
  middleName_contains: z.string().max(255).optional(),
  middleName_endsWith: z.string().max(255).optional(),
  middleName_startsWith: z.string().max(255).optional(),
  middleName_in: z.array(z.string().max(255)).optional(),
  middleName_notIn: z.array(z.string().max(255)).optional(),

  isActive: z.boolean().optional(),

  username: z.string().min(5).max(255).optional(),
  username_not: z.string().min(5).max(255).optional(),
  username_contains: z.string().max(255).optional(),
  username_endsWith: z.string().max(255).optional(),
  username_startsWith: z.string().max(255).optional(),
  username_in: z.array(z.string().min(5).max(255)).optional(),
  username_notIn: z.array(z.string().min(5).max(255)).optional(),

  createdAt: z.string().datetime().transform(str => new Date(str)).optional(),
  createdAt_gt: z.string().datetime().transform(str => new Date(str)).optional(),
  createdAt_gte: z.string().datetime().transform(str => new Date(str)).optional(),
  createdAt_lt: z.string().datetime().transform(str => new Date(str)).optional(),
  createdAt_lte: z.string().datetime().transform(str => new Date(str)).optional(),
  createdAt_not: z.string().datetime().transform(str => new Date(str)).optional(),
  createdAt_in: z.array(z.string().datetime().transform(str => new Date(str))).optional(),
  createdAt_notIn: z.array(z.string().datetime().transform(str => new Date(str))).optional(),

  updatedAt: z.string().datetime().transform(str => new Date(str)).optional(),
  updatedAt_gt: z.string().datetime().transform(str => new Date(str)).optional(),
  updatedAt_gte: z.string().datetime().transform(str => new Date(str)).optional(),
  updatedAt_lt: z.string().datetime().transform(str => new Date(str)).optional(),
  updatedAt_lte: z.string().datetime().transform(str => new Date(str)).optional(),
  updatedAt_not: z.string().datetime().transform(str => new Date(str)).optional(),
  updatedAt_in: z.array(z.string().datetime().transform(str => new Date(str))).optional(),
  updatedAt_notIn: z.array(z.string().datetime().transform(str => new Date(str))).optional(),

  pageSize: z.number().default(API_PAGESIZE),
  page: z.number().default(1)
})

const getUsersResponse = getPaginatedList(userModelDTO)

const getUserParams = z.object({
  id: z.string().uuid(),
})

const getUserResponse = z.object({
  data: userModelDTO
})

const createUserBody = userParser.omit({
  id: true,
  userRoles: true,
  phones: true,
  emails: true,
  createdAt: true,
  updatedAt: true,
}).merge(z.object({
  roleSlugs: z.array(z.string()).default([]),
  phones: z.array(z.string()).default([]),
  emails: z.array(z.string()).default([]),
}))

const createUserResponse = z.object({
  data: userModelDTO
})

const editUserParams = z.object({
  id: z.string().uuid(),
})

const editUserBody = createUserBody.partial()
const editUserResponse = z.object({
  data: userModelDTO
})

const deleteUserParams = z.object({
  id: z.string().uuid(),
})

const deleteUserResponse = z.object({
  data: userModelDTO
})

export const { $ref, schemas: userSchemas } = buildJsonSchemas({
  getUsersQuery,
  getUsersResponse,
  getUserParams,
  getUserResponse,
  createUserBody,
  editUserParams,
  editUserBody,
  createUserResponse,
  editUserResponse,
  deleteUserParams,
  deleteUserResponse
}, { $id: 'userSchema' })

export type GetUsersQuery = z.infer<typeof getUsersQuery>
export type GetUsersResponse = z.infer<typeof getUsersResponse>
export type GetUserParams = z.infer<typeof getUserParams>
export type GetUserResponse = z.infer<typeof getUserResponse>
export type CreateUserBody = z.infer<typeof createUserBody>
export type CreateUserResponse = z.infer<typeof createUserResponse>
export type EditUserParams = z.infer<typeof editUserParams>
export type EditUserBody = z.infer<typeof editUserBody>
export type EditUserResponse = z.infer<typeof editUserResponse>
export type DeleteUserParams = z.infer<typeof deleteUserParams>
export type DeleteUserResponse = z.infer<typeof deleteUserResponse>

export interface GetUsersConfig extends RequestGenericInterface {
  Querystring: GetUsersQuery
}

export interface GetUserConfig extends RequestGenericInterface {
  Params: GetUserParams
}

export interface CreateUserConfig extends RequestGenericInterface {
  Body: CreateUserBody
}

export interface EditUserConfig extends RequestGenericInterface {
  Params: EditUserParams
  Body: EditUserBody
}

export interface DeleteUserConfig extends RequestGenericInterface {
  Params: DeleteUserParams
}
