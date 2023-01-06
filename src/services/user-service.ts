import { DbClient, Store, UserDB } from '@/store'
import {
  formWhereOptions, NotFoundError, InvalidRequestError, makeIndexed
} from '@/common'
import type { QueryOptions } from '@/types/query'
import { User } from '@/models'
import { USER_ROLE_SLUG } from '@/constants/roles'
import type { ResolveType } from '@/types/utility'
import { API_PAGESIZE } from '@/config/api-config'
import type { PaginationData, EntityList } from '@/types/api'

type CreateUserOptions = {
  id?: string
  firstName?: string | null
  lastName: string
  middleName?: string | null
  isActive?: boolean
  username: string
  password: string
  roleSlugs: string[]
  phones: string[]
  emails: string[]
}

type UpdateByID = { id: string } & Partial<Omit<CreateUserOptions, 'id'>>
type UpdateByUsername = { username: string } & Partial<Omit<CreateUserOptions, 'id' | 'username'>>

type UpdateUserOptions = ResolveType<UpdateByID | UpdateByUsername>

type DeleteUserOptions = { id: string } | { username: string }

export class UserService {
  store: DbClient

  constructor (store: DbClient) {
    this.store = store
  }

  async getUsers (options?: QueryOptions<UserDB>) {
    const where = this.formWhere(options)
    const pagination = await this.getPaginationData(options, where)
    const skip = ((options?.page || 1) - 1) * pagination.pageSize

    const data = pagination.totalCount
      ? await this.store.entity('user').findMany({
        ...this.getBaseQueryOption(),
        where,
        take: pagination.pageSize,
        skip
      })
      : []

    return {
      data,
      pagination
    } satisfies EntityList<UserDB>
  }

  async getUserById (id: string) {
    const data = await this.store.entity('user').findUnique({
      ...this.getBaseQueryOption(),
      where: {
        id
      }
    })
    if (!data) {
      throw new NotFoundError(`User with id: ${id} not found`)
    }
    return new User(data)
  }

  async getUserByUserName (username: string) {
    const data = await this.store.entity('user').findUnique({
      include: {
        emails: true,
        phones: true,
        userRoles: {
          include: {
            role: true
          }
        }
      },
      where: {
        username
      }
    })
    if (!data) {
      throw new NotFoundError(`User with username: ${username} not found`)
    }
    return new User(data)
  }

  async createUser (options: CreateUserOptions) {
    const existed = await this.store.entity('user').findMany({
      where: {
        OR: [
          { id: options.id },
          { username: options.username }
        ]
      }
    })

    if (existed.length) {
      throw new InvalidRequestError('User already exists')
    }

    const existedRoles = await this.store.entity('role').findMany()
    const rolesBySlug = makeIndexed(existedRoles, 'slug')

    const roles = options.roleSlugs.length
      ? options.roleSlugs.filter(slug => rolesBySlug[slug])
      : [USER_ROLE_SLUG]

    const newUser = await this.store.entity('user').create({
      data: {
        id: options.id,
        firstName: options.firstName,
        lastName: options.lastName,
        middleName: options.middleName,
        isActive: options.isActive,
        username: options.username,
        password: User.hashPassword(options.password),
        userRoles: {
          create: roles.map(slug => ({
            role: {
              connect: {
                slug
              }
            }
          }))
        },
        phones: options.phones.length
          ? {
            create: options.phones.map(phone => ({ phone }))
          }
          : undefined,
        emails: options.emails.length
          ? {
            create: options.emails.map(email => ({ email }))
          }
          : undefined,
      },
      ...this.getBaseQueryOption()
    })

    return new User(newUser)
  }

  async updateUser (options: UpdateUserOptions) {
    const whereOptions = 'id' in options
      ? { id: options.id }
      : { username: options.username }

    const existed = await this.store.entity('user').findUnique({
      where: whereOptions,
      ...this.getBaseQueryOption()
    })

    if (!existed) {
      throw new NotFoundError('User not exist')
    }

    const existedUser = new User(existed)

    let roles: undefined | string[]
    if (options.roleSlugs) {
      const existedRoles = await this.store.entity('role').findMany()
      const rolesBySlug = makeIndexed(existedRoles, 'slug')

      roles = options.roleSlugs.length
        ? options.roleSlugs.filter(slug => rolesBySlug[slug])
        : [USER_ROLE_SLUG]
    }

    const newUser = await this.store.entity('user').update({
      where: whereOptions,
      data: {
        firstName: options.firstName,
        lastName: options.lastName,
        middleName: options.middleName,
        isActive: options.isActive,
        username: options.username,
        password: options.password ? User.hashPassword(options.password) : undefined,
        ...this.getUserRolesUpdateOption(options, existedUser),
        ...this.getPhonesUpdateOptions(options, existedUser),
        ...this.getEmailsUpdateOptions(options, existedUser),
      },
      ...this.getBaseQueryOption()
    })

    return new User(newUser)
  }

  async deleteUser (options: DeleteUserOptions) {
    const whereOptions = 'id' in options
      ? { id: options.id }
      : { username: options.username }

    const existed = await this.store.entity('user').findUnique({
      where: whereOptions,
      ...this.getBaseQueryOption()
    })
    if (!existed) {
      throw new NotFoundError('User not exist')
    }

    const existedUser = new User(existed)

    await this.store.entity('user').delete({
      where: whereOptions
    })

    return existedUser
  }

  // eslint-disable-next-line class-methods-use-this
  private formWhere (options?: QueryOptions<UserDB>): Store.UserFindManyArgs['where'] | undefined {
    if (!options) {
      return undefined
    }
    return formWhereOptions<UserDB>(options)
  }

  // eslint-disable-next-line class-methods-use-this
  private getBaseQueryOption () {
    return {
      include: {
        emails: true,
        phones: true,
        userRoles: {
          include: {
            role: true
          }
        },
      }
    } satisfies Store.UserFindManyArgs
  }

  // eslint-disable-next-line class-methods-use-this
  private getUserRolesUpdateOption ({ roleSlugs }: UpdateUserOptions, { userRoles }: User) {
    if (!roleSlugs) {
      return {}
    }
    const existedRoleIdsBySlug = userRoles.reduce((acc, item) => {
      acc[item.role.slug] = item.id
      return acc
    }, {} as Record<string, string>)

    const newRoleBySlug = roleSlugs.reduce((acc, item) => {
      acc[item] = item
      return acc
    }, {} as Record<string, string>)

    const rolesToDelete = userRoles.filter(el => !newRoleBySlug[el.role.slug])
    const rolesToAdd = roleSlugs.filter(slug => !existedRoleIdsBySlug[slug])

    return {
      userRoles: {
        delete: rolesToDelete.length
          ? rolesToDelete.map(el => ({ id: el.id }))
          : undefined,
        create: rolesToAdd.length
          ? rolesToAdd.map(slug => ({ role: { connect: { slug } } }))
          : undefined
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private getPhonesUpdateOptions ({ phones }: UpdateUserOptions, existed: User) {
    if (!phones) {
      return {}
    }

    const existedPhoneIdsByPhone = existed.phones.reduce((acc, item) => {
      acc[item.phone] = item.id
      return acc
    }, {} as Record<string, string>)

    const newPhoneByPhones = phones.reduce((acc, item) => {
      acc[item] = item
      return acc
    }, {} as Record<string, string>)

    const phonesToDelete = existed.phones.filter(el => !newPhoneByPhones[el.phone])
    const phonesToAdd = phones.filter(phone => !existedPhoneIdsByPhone[phone])

    return {
      phones: {
        delete: phonesToDelete.length
          ? phonesToDelete.map(item => ({
            phone_userId: {
              phone: item.phone, userId: existed.id
            }
          }))
          : undefined,
        create: phonesToAdd.length
          ? phonesToAdd.map(phone => ({ phone }))
          : undefined
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private getEmailsUpdateOptions ({ emails }: UpdateUserOptions, existed: User) {
    if (!emails) {
      return {}
    }

    const existedEmailsIdsByEmail = existed.emails.reduce((acc, item) => {
      acc[item.email] = item.id
      return acc
    }, {} as Record<string, string>)

    const newEmailsByEmail = emails.reduce((acc, item) => {
      acc[item] = item
      return acc
    }, {} as Record<string, string>)

    const emailsToDelete = existed.emails.filter(el => !newEmailsByEmail[el.email])
    const emailsToAdd = emails.filter(email => !existedEmailsIdsByEmail[email])

    return {
      emails: {
        delete: emailsToDelete.length
          ? emailsToDelete.map(item => ({
            email_userId: {
              email: item.email, userId: existed.id
            }
          }))
          : undefined,
        create: emailsToAdd.length
          ? emailsToAdd.map(email => ({ email }))
          : undefined
      }
    }
  }

  private async getPaginationData (
    options?: QueryOptions<UserDB>,
    where?: Store.UserFindManyArgs['where']
  ): Promise<PaginationData> {
    const pageSize = options?.pageSize || API_PAGESIZE
    const page = options?.page || 1
    const totalCount = await this.store.entity('user').count({ where })

    const totalPages = Math.ceil(totalCount / pageSize) || 1

    return {
      page,
      totalPages,
      totalCount,
      pageSize
    }
  }
}
