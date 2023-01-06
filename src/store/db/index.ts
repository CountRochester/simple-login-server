import type {
  User as UserDB,
  Role as RoleDB,
  UserEmail as UserEmailDB,
  UserPhone as UserPhoneDB,
  UserRole as UserRoleDB
} from '@prisma/client'

export type {
  Prisma as Store,
  User as UserDB,
  Role as RoleDB,
  UserEmail as UserEmailDB,
  UserPhone as UserPhoneDB,
  UserRole as UserRoleDB
} from '@prisma/client'
export * from './db-client'
export * from './init-db'

export type UserDBFull = UserDB & {
  phones: UserPhoneDB[]
  emails: UserEmailDB[]
  userRoles: (UserRoleDB & {
      role: RoleDB
  })[]
}
