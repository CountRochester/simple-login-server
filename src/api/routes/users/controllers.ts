import {
  FastifyInstance, FastifyPluginCallback, FastifyPluginOptions,
} from 'fastify'
import {
  API_USER_FIND,
  API_USER_FIND_ONE,
  API_USER_CREATE,
  API_USER_UPDATE,
  API_USER_DELETE,
} from '@/config/api-config'
import { dbClient } from '@/store'
import {
  NotFoundError,
  ForbiddenError,
  InvalidRequestError,
} from '@/common/errors'

import { UserService, AuthService } from '@/services'
import {
  getUsersOptions,
  getUserOptions,
  createUserOptions,
  editUserOptions,
  deleteUserOptions,
} from './route-options'
import type {
  GetUsersConfig,
  GetUsersResponse,
  GetUserConfig,
  GetUserResponse,
  CreateUserConfig,
  EditUserConfig,
  CreateUserResponse,
  EditUserResponse,
  DeleteUserConfig,
  DeleteUserResponse
} from './types'

export const usersRoute: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: (err?: Error) => void
) => {
  fastify.get<GetUsersConfig>(
    API_USER_FIND,
    getUsersOptions,
    async (req, reply) => {
      const authService = new AuthService(dbClient)
      await authService.getUserFromCookie(req)

      const service = new UserService(dbClient)
      const users = await service.getUsers(req.query)

      const result = users satisfies GetUsersResponse

      reply
        .type('application/json')
        .status(200)
        .send(result)
    }
  )

  fastify.get<GetUserConfig>(
    API_USER_FIND_ONE,
    getUserOptions,
    async (req, reply) => {
      const authService = new AuthService(dbClient)
      await authService.getUserFromCookie(req)

      const service = new UserService(dbClient)
      const existed = await service.getUserById(req.params.id)

      if (!existed) {
        throw new NotFoundError(`User id: ${req.params.id} not found`)
      }

      const result = {
        data: existed.toDTO()
      } satisfies GetUserResponse

      reply
        .type('application/json')
        .status(200)
        .send(result)
    }
  )

  fastify.post<CreateUserConfig>(
    API_USER_CREATE,
    createUserOptions,
    async (req, reply) => {
      const authService = new AuthService(dbClient)
      const user = await authService.getUserFromCookie(req, true)

      if (user && !user.isAdmin) {
        throw new ForbiddenError('Only admin or candidates can create new users')
      }

      const service = new UserService(dbClient)
      const existed = await service.getUserByUserName(req.body.username)

      if (existed) {
        throw new InvalidRequestError('User already exists')
      }

      const newUser = await service.createUser(req.body)

      const result = {
        data: newUser.toDTO()
      } satisfies CreateUserResponse

      reply
        .type('application/json')
        .status(201)
        .send(result)
    }
  )

  fastify.put<EditUserConfig>(
    API_USER_UPDATE,
    editUserOptions,
    async (req, reply) => {
      const authService = new AuthService(dbClient)
      const user = await authService.getUserFromCookie(req, true)
      if (user.id !== req.params.id && !user.isAdmin) {
        throw new ForbiddenError('You cannot modify other user')
      }

      const service = new UserService(dbClient)
      const existed = await service.getUserById(req.params.id)

      if (!existed) {
        throw new NotFoundError(`User id: ${req.params.id} not found`)
      }
      const updated = await service.updateUser({
        id: req.params.id,
        ...req.body
      })

      const result = {
        data: updated.toDTO()
      } satisfies EditUserResponse

      reply
        .type('application/json')
        .status(200)
        .send(result)
    }
  )

  fastify.delete<DeleteUserConfig>(
    API_USER_DELETE,
    deleteUserOptions,
    async (req, reply) => {
      const authService = new AuthService(dbClient)
      const user = await authService.getUserFromCookie(req, true)

      if (!user.isAdmin) {
        throw new ForbiddenError('Only admin can delete users')
      }

      const service = new UserService(dbClient)
      const existed = await service.getUserById(req.params.id)

      if (!existed) {
        throw new NotFoundError(`User id: ${req.params.id} not found`)
      }
      const deleted = await service.deleteUser({ id: req.params.id })

      const result = {
        data: deleted.toDTO()
      } satisfies DeleteUserResponse

      reply
        .type('application/json')
        .status(200)
        .send(result)
    }
  )

  done()
}
