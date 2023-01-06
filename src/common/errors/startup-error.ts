import { ServerError } from './server-error'

export class StartupError extends ServerError {
  type = 'Server startup Error'

  statusCode = 500
}
