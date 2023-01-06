import { ServerError } from './server-error'

export class UnknownError extends ServerError {
  type = 'Unknown Error'

  statusCode = 500
}
