import {
  FastifyInstance, FastifyPluginCallback, FastifyPluginOptions
} from 'fastify'
import { dbClient } from '@/store'
import { AuthService } from '@/services'
import {
  API_LOGIN,
  API_LOGOUT,
  API_CURRENT_USER,
  API_COOKIE_FQDN,
  API_TOKEN_NAME,
} from '@/config/api-config'
import {
  getLoginOptions,
  getCurrentUserOptions,
  getLogoutOptions
} from './route-options'
import type {
  LoginResponse,
  LoginConfig,
  UserResponse,
  LogoutResponse,
} from './types'

export const authRoute: FastifyPluginCallback = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: (err?: Error) => void
) => {
  fastify.post<LoginConfig>(API_LOGIN, getLoginOptions, async (req, reply) => {
    const { username, password } = req.body

    const service = new AuthService(dbClient)
    const tokenData = await service.getLoginTokenData(username, password)

    const res: LoginResponse = {
      status: 'success',
    }

    const token = await reply.jwtSign(tokenData)

    reply
      .setCookie(API_TOKEN_NAME, token, {
        domain: API_COOKIE_FQDN,
        path: '/',
        secure: false, // send cookie over HTTPS only
        httpOnly: true,
        sameSite: true // alternative CSRF protection
      })
      .type('application/json')
      .send(res)
  })

  fastify.get(API_CURRENT_USER, getCurrentUserOptions, async (req, reply) => {
    const service = new AuthService(dbClient)
    const user = await service.getUserFromCookie(req)
    const token = await reply.jwtSign(service.getTokenData(user))

    const res: UserResponse = user

    reply
      .setCookie(API_TOKEN_NAME, token, {
        domain: API_COOKIE_FQDN,
        path: '/',
        secure: false, // send cookie over HTTPS only
        httpOnly: true,
        sameSite: true // alternative CSRF protection
      })
      .type('application/json')
      .send(res)
  })

  fastify.post(API_LOGOUT, getLogoutOptions, async (req, reply) => {
    const res: LogoutResponse = {
      status: 'success',
      message: 'You successfully logged out'
    }

    reply
      .clearCookie(API_TOKEN_NAME)
      .type('application/json')
      .send(res)
  })

  done()
}
