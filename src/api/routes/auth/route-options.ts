import { RouteShorthandOptions } from 'fastify'
import { $ref } from './types'

export const getLoginOptions: RouteShorthandOptions = {
  schema: {
    description: 'Авторизация пользователя',
    tags: ['auth'],
    consumes: ['application/json'],
    produces: ['application/json'],
    body: $ref('loginBody'),
    response: {
      200: $ref('loginResponse')
    }
  }
}

export const getCurrentUserOptions: RouteShorthandOptions = {
  schema: {
    description: 'Получение данных текущего пользователя',
    tags: ['auth'],
    consumes: ['application/json'],
    produces: ['application/json'],
    response: {
      200: $ref('userModel')
    }
  }
}

export const getLogoutOptions: RouteShorthandOptions = {
  schema: {
    description: 'Выход из аккаунта',
    tags: ['auth'],
    consumes: ['application/json'],
    produces: ['application/json'],
    response: {
      200: $ref('logoutResponse')
    }
  }
}
