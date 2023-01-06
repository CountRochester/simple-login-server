import { ServerError } from './server-error'

export class InvalidRequestError extends ServerError {
  type = 'Invalid Request Error'

  statusCode = 400
}
