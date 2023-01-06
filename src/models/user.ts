import { z } from 'zod'
import crypto from 'crypto'
import { ADMIN_ROLE_SLUG, USER_ROLE_SLUG } from '@/constants/roles'
import { userRoleParser } from './role'
import { userEmailParser } from './user-email'
import { userPhoneParser } from './user-phone'

export const userParser = z.object({
  id: z.string().uuid(),
  firstName: z.union([z.string().max(255), z.null()]).default(null),
  lastName: z.string().max(255),
  middleName: z.union([z.string().max(255), z.null()]).default(null),
  phones: z.array(userPhoneParser),
  emails: z.array(userEmailParser),
  isActive: z.boolean().default(true),
  username: z.string().min(5).max(255),
  password: z.string().min(1).max(255),
  userRoles: z.array(userRoleParser),
  createdAt: z.union([z.string().datetime(), z.date()]).transform(el => new Date(el)),
  updatedAt: z.union([z.string().datetime(), z.date()]).transform(el => new Date(el)),
})

export const userModel = userParser.omit({ password: true })

export const userModelDTO = userModel.transform(({ phones, emails, ...rest }) => ({
  ...rest,
  phones: phones.map(el => el.phone),
  emails: emails.map(el => el.email),
}))

export class User {
  id: string

  firstName: string | null

  lastName: string

  middleName: string | null

  phones: z.infer<typeof userPhoneParser>[]

  emails: z.infer<typeof userEmailParser>[]

  isActive: boolean

  username: string

  userRoles: z.infer<typeof userRoleParser>[]

  createdAt: Date

  updatedAt: Date

  static hashPassword (password: string): string {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')

    return [salt, hash].join('.')
  }

  static verifyPassword (password: string, hashedPassword: string) {
    const [salt, hash] = hashedPassword.split('.')
    const newHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return hash === newHash
  }

  get isAdmin () {
    return this.userRoles.find(el => el.role.slug === ADMIN_ROLE_SLUG)
  }

  get isUser () {
    return this.userRoles.find(el => el.role.slug === USER_ROLE_SLUG)
  }

  constructor (dto: z.input<typeof userModel>) {
    const data = userModel.parse(dto)

    this.id = data.id
    this.firstName = data.firstName
    this.lastName = data.lastName
    this.middleName = data.middleName
    this.phones = data.phones
    this.emails = data.emails
    this.isActive = data.isActive
    this.username = data.username
    this.userRoles = data.userRoles
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  toDTO () {
    return userModelDTO.parse(this)
  }
}
