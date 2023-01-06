import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import {
  API_SERVER_PORT,
  API_SWAGGER_ROUTE,
  API_TOKEN_SECRET,
  API_TOKEN_NAME,
  API_LOGIN,
  API_USER_CREATE,
  API_TOKEN_EXPIRES,
} from '@/config/api-config'
import { registerPublicRoutes, getMainApiUrl } from '@/common'
import { ApiServer } from './server'

const mainApi = new ApiServer({
  port: API_SERVER_PORT,
  routeRegisterHandler: registerPublicRoutes,
  name: 'Public API',
  swaggerOptions: {
    title: 'API',
    description: 'Main API documentation',
    routePrefix: API_SWAGGER_ROUTE,
  }
})

mainApi.instance.register(jwt, {
  secret: API_TOKEN_SECRET,
  cookie: {
    cookieName: API_TOKEN_NAME,
    signed: false,
  },
  verify: {
    ignoreExpiration: false
  },
  sign: {
    expiresIn: API_TOKEN_EXPIRES
  }
})

mainApi.instance.register(cookie)

mainApi.instance.addHook('onRequest', async (req, reply) => {
  if (!req.routerPath) {
    return
  }

  const allowedRoutes = [
    getMainApiUrl(API_USER_CREATE),
    getMainApiUrl(API_LOGIN),
  ]

  if (allowedRoutes.includes(req.routerPath)
    || req.routerPath.startsWith(API_SWAGGER_ROUTE)
    || req.routerPath.startsWith('/healthcheck')) {
    return
  }
  try {
    await req.jwtVerify()
  } catch (err) {
    reply
      .clearCookie(API_TOKEN_NAME)
      .status(401)
      .send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Not authorized'
      })
  }
})

export {
  mainApi
}
