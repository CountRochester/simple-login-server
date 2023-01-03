import { defaultRoles } from '@/constants/roles'
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
}
