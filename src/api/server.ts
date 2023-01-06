import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { withRefResolver } from 'fastify-zod'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import packageJson from '@/../package.json'
import { StartupError } from '@/common'

interface SwaggerOptions {
  title: string
  description: string
  routePrefix: string
}
interface ApiServerOptions {
  port: number
  name?: string
  routeRegisterHandler: (server: FastifyInstance) => void
  authCheckHandler?: (req: FastifyRequest, reply: FastifyReply) => void | Promise<void>,
  swaggerOptions: SwaggerOptions
}

export class ApiServer {
  public instance: FastifyInstance

  public name = 'API'

  private readonly port: number

  get server (): FastifyInstance['server'] {
    return this.instance.server
  }

  constructor ({
    port, routeRegisterHandler, name, authCheckHandler, swaggerOptions
  }: ApiServerOptions) {
    this.instance = fastify({ logger: true })
    this.port = port
    this.configSwagger(this.instance, swaggerOptions)
    routeRegisterHandler(this.instance)
    if (name) {
      this.name = name
    }
    this.registerHealthCheckRoute()
    if (authCheckHandler) {
      this.instance.decorate('checkAuth', authCheckHandler)
    }
  }

  async start () {
    await this.instance.ready()
    await new Promise<void>((resolve, reject) => {
      this.instance.listen({
        port: this.port,
        host: '0.0.0.0'
      }, (err, address) => {
        if (err) {
          console.error(err)
          reject(new StartupError(`Error starting ${this.name}: ${err.message}`, err))
        }
        console.log(`${this.name} running on: ${address}`)
        resolve()
      })
    })
  }

  async stop () {
    try {
      await this.instance.close()
    } catch (err) {
      console.log(err)
    }
  }

  async ready () {
    await this.instance.ready()
  }

  private registerHealthCheckRoute () {
    this.instance.get('/healthcheck', async (req, reply) => {
      reply
        .code(200)
        .type('application/json')
        .send({ status: 'Ok' })
    })
  }

  // eslint-disable-next-line class-methods-use-this
  configSwagger (instance: FastifyInstance, options: SwaggerOptions) {
    instance.register(swagger, withRefResolver({
      openapi: {
        info: {
          title: options.title,
          description: options.description,
          version: packageJson.version
        },
      },

    }))

    instance.register(swaggerUi, {
      routePrefix: options.routePrefix,
      uiConfig: {
        docExpansion: 'none',
        deepLinking: true
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject, request, reply) => swaggerObject,
      transformSpecificationClone: true,
    })
  }
}
