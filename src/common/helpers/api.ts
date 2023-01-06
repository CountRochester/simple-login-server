/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import fs from 'fs'
import path from 'path'
import { FastifyInstance, FastifyPluginCallback } from 'fastify'
import { z } from 'zod'
import { JsonSchema } from 'fastify-zod'
import { ROOT_PATH } from '@/config/main-config'
import {
  API_ROUTE_PREFIX,
  API_VERSION,
  API_SWAGGER_ROUTE,
} from '@/config/api-config'
import { API_ROUTES_PATH } from '@/constants/api'

interface GetApiUrlOptions {
  pathName: string
  swaggerRoute: string
  routePrefix: string
  version: string
}

interface RegisterRoutesOptions {
  server: FastifyInstance
  physicalPath: string
  routePrefix: string
  version: string
}

const getPrefix = (routePrefix: string, version: string) => [routePrefix, version]
  .filter(el => el)
  .join('/')

export const getApiUrl = (
  options: GetApiUrlOptions
): string => options.pathName === options.swaggerRoute
  ? options.swaggerRoute
  : `${getPrefix(options.routePrefix, options.version)}${options.pathName}`

export const getMainApiUrl = (pathName: string) => getApiUrl({
  pathName,
  swaggerRoute: API_SWAGGER_ROUTE,
  routePrefix: API_ROUTE_PREFIX,
  version: API_VERSION
})

export const registerRoutes = (options: RegisterRoutesOptions) => {
  const dirContent = fs.readdirSync(path.join(ROOT_PATH, options.physicalPath))
  const folderNames = dirContent.filter(el => !el.endsWith('.ts') && el !== '__tests__')

  const modules = folderNames
    .map(el => require(path.join(ROOT_PATH, options.physicalPath, el)))
  const handlers = modules.map(el => {
    const key = Object.keys(el)
      .find(elem => typeof el[elem] === 'function' && elem.endsWith('Route'))
    if (!key) {
      return null
    }
    return el[key] as FastifyPluginCallback
  }).filter(el => el) as FastifyPluginCallback[]

  const schemas = modules.map(el => {
    const key = Object.keys(el)
      .find(elem => typeof el[elem] !== 'function' && elem.endsWith('Schemas'))
    if (!key) {
      return null
    }
    return el[key] as JsonSchema[]
  }).filter(el => el).flat() as JsonSchema[]

  handlers.forEach(el => {
    options.server.register(el, { prefix: `${getPrefix(options.routePrefix, options.version)}` })
  })

  schemas.forEach(schema => {
    options.server.addSchema(schema)
  })
}

export const registerPublicRoutes = (server: FastifyInstance) => registerRoutes({
  server,
  physicalPath: API_ROUTES_PATH,
  routePrefix: API_ROUTE_PREFIX,
  version: API_VERSION
})

export const getPaginatedList = <
  T extends z.ZodObject<z.ZodRawShape> | z.ZodEffects<any>
>(obj: T) => {
  const pagination = z.object({
    page: z.number().min(1),
    totalPages: z.number().min(1),
    totalCount: z.number().min(0),
    pageSize: z.number().min(1)
  })

  return z.object({
    data: z.array(obj),
    pagination
  })
}
