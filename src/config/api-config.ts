export const {
  API_COOKIE_FQDN = '',
  API_TOKEN_EXPIRES = '72h',
  API_TOKEN_SECRET = '',
  API_TOKEN_NAME = 'token',
  API_ROUTE_PREFIX = '/api',
  API_VERSION = 'v1',
  API_LOGIN = '/auth/login',
  API_LOGOUT = '/auth/logout',
  API_CURRENT_USER = '/auth/current-user',
  API_USER_FIND = '/user',
  API_USER_FIND_ONE = '/user/:id',
  API_USER_CREATE = '/user',
  API_USER_UPDATE = '/user/:id',
  API_USER_DELETE = '/user/:id',
  API_SWAGGER_ROUTE = '/docs'
} = process.env

export const API_SERVER_PORT = process.env.API_SERVER_PORT
  ? +process.env.API_SERVER_PORT
  : 5000

export const API_PAGESIZE = process.env.API_PAGESIZE
  ? +process.env.API_PAGESIZE
  : 10
