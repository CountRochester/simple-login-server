import { RouteShorthandOptions } from 'fastify'
import { $ref } from './types'

export const getUsersOptions: RouteShorthandOptions = {
  schema: {
    description: 'Find existing users',
    tags: ['users'],
    consumes: ['application/json'],
    produces: ['application/json'],
    querystring: $ref('getUsersQuery'),
    response: {
      200: $ref('getUsersResponse')
    }
  }
}

export const getUserOptions: RouteShorthandOptions = {
  schema: {
    description: 'Find existing users',
    tags: ['users'],
    consumes: ['application/json'],
    produces: ['application/json'],
    params: $ref('getUserParams'),
    response: {
      200: $ref('getUserResponse')
    }
  }
}

export const createUserOptions: RouteShorthandOptions = {
  schema: {
    description: 'Creating new user',
    tags: ['users'],
    consumes: ['application/json'],
    produces: ['application/json'],
    body: $ref('createUserBody'),
    response: {
      201: $ref('createUserResponse')
    }
  }
}

export const editUserOptions: RouteShorthandOptions = {
  schema: {
    description: 'Edit user by ID',
    tags: ['users'],
    consumes: ['application/json'],
    produces: ['application/json'],
    params: $ref('editUserParams'),
    body: $ref('editUserBody'),
    response: {
      200: $ref('editUserResponse')
    }
  }
}

export const deleteUserOptions: RouteShorthandOptions = {
  schema: {
    description: 'Delete user by ID',
    tags: ['users'],
    consumes: ['application/json'],
    produces: ['application/json'],
    params: $ref('deleteUserParams'),
    response: {
      200: $ref('deleteUserResponse')
    }
  }
}
