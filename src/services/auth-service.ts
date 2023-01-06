import { FastifyRequest } from 'fastify'
import { DbClient, UserDBFull } from '@/store'
import { userModel, User, tokenParser } from '@/models'
import { ForbiddenError, NotAuthorizedError } from '@/common'
import { API_TOKEN_NAME } from '@/config/api-config'

export class AuthService {
  store: DbClient

  constructor (store: DbClient) {
    this.store = store
  }

  async getLoginTokenData (username: string, password: string) {
    const user = await this.store.entity('user').findUnique({
      where: { username },
      include: {
        userRoles: {
          include: {
            role: true,
          }
        },
        emails: true,
        phones: true,
      }
    })
    if (!user || !user.isActive) {
      throw new NotAuthorizedError('Invalid credentials')
    }
    const isPasswordValid = User.verifyPassword(password, user.password)
    if (!isPasswordValid) {
      throw new NotAuthorizedError('Invalid credentials')
    }

    return this.getTokenData(user)
  }

  getUserFromCookie(req: FastifyRequest): Promise<UserDBFull>

  getUserFromCookie(req: FastifyRequest, isWrapUser: true): Promise<User>

  async getUserFromCookie (
    req: FastifyRequest,
    isWrapUser?: boolean
  ): Promise<User | UserDBFull> {
    const user = this.getUserFromCookieSync(req)
    if (!user) {
      throw new NotAuthorizedError('Invalid credentials')
    }

    const userInDB = await this.store.entity('user').findUnique({
      where: { id: user.id },
      include: {
        userRoles: {
          include: {
            role: true,
          }
        },
        emails: true,
        phones: true
      }
    })
    if (!userInDB) {
      throw new NotAuthorizedError('Invalid credentials')
    }

    if (!userInDB.isActive) {
      throw new ForbiddenError('User is inactive')
    }

    if (isWrapUser) {
      return new User(userInDB)
    }

    return userInDB
  }

  // eslint-disable-next-line class-methods-use-this
  getTokenData (user: UserDBFull) {
    return tokenParser.parse({
      user: userModel.parse(user),
    })
  }

  // eslint-disable-next-line class-methods-use-this
  private getUserFromCookieSync (req: FastifyRequest) {
    const token = req.cookies[API_TOKEN_NAME] || ''

    if (!token) {
      return null
    }

    const exist = tokenParser.safeParse(req.server.jwt.decode(token))
    if (exist.success) {
      return new User(exist.data.user)
    }

    return null
  }
}
