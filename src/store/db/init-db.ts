import { defaultRoles, ADMIN_ROLE_SLUG } from '@/constants/roles'
import {
  DEFAULT_ADMIN_LAST_NAME,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME
} from '@/constants/users'
import { User } from '@/models'
import { DbClient } from './db-client'

export const initDb = async (client: DbClient) => {
  await Promise.allSettled(defaultRoles.map(el => client.entity('role').upsert({
    where: {
      slug: el.slug,
    },
    create: {
      slug: el.slug,
      name: el.name
    },
    update: {
      name: el.name
    }
  })))

  const usersCount = await client.entity('user').count()
  if (usersCount) {
    return
  }

  await client.entity('user').create({
    data: {
      username: DEFAULT_ADMIN_USERNAME,
      password: User.hashPassword(DEFAULT_ADMIN_PASSWORD),
      lastName: DEFAULT_ADMIN_LAST_NAME,
      isActive: true,
      userRoles: {
        create: {
          role: {
            connect: {
              slug: ADMIN_ROLE_SLUG
            }
          }
        }
      }
    }
  })
}
