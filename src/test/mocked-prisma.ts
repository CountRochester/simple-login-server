import { prisma } from '@/store/db/prisma'
import type { MockedPrismaClient } from '@/types/test'

export const mockedPrismaClient = prisma as MockedPrismaClient
