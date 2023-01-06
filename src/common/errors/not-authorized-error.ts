import { ServerError } from './server-error'

const DEFAULT_MESSAGE = 'Not authorized'

export class NotAuthorizedError extends ServerError {
  type = 'Not Authorized Error'

  statusCode = 401

  constructor (message?: string, details?: any) {
    super(message || DEFAULT_MESSAGE, details)
    Object.setPrototypeOf(this, NotAuthorizedError.prototype)
  }
}
