import type { DeepMockProxy } from 'jest-mock-extended'
import type { PrismaClient } from '@prisma/client'

export type MockedPrismaClient = DeepMockProxy<PrismaClient>
