import { ServerError } from './server-error'

const DEFAULT_MESSAGE = 'Not found'

export class NotFoundError extends ServerError {
  type = 'Not Found Error'

  statusCode = 404

  constructor (message?: string, details?: any) {
    super(message || DEFAULT_MESSAGE, details)

    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}
