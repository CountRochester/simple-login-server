import { ServerError } from './server-error'

export class ForbiddenError extends ServerError {
  type = 'Forbidden Error'

  statusCode = 403
}
