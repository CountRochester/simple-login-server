export abstract class ServerError extends Error {
  abstract type: string

  abstract statusCode: number

  details?: any

  constructor (message: string, details?: any) {
    super(message)

    this.details = details

    Object.setPrototypeOf(this, ServerError.prototype)
  }
}
