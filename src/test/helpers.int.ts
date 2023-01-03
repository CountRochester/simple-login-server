import type { Prisma } from '@prisma/client'
import type { FirstCharLowerCase } from '@/types/utility'
import { prisma } from '@/store/db/prisma'

export const clearDB = async (doNotClear: FirstCharLowerCase<Prisma.ModelName>[] = []) => {
  const entities = [
    'role',
  ] satisfies FirstCharLowerCase<Prisma.ModelName>[]
  const entitiesToClear = entities.filter(el => !doNotClear.includes(el))

  await prisma.$transaction(entitiesToClear
    .map(el => prisma[el].deleteMany()))
}
