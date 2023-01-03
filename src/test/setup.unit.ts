/* eslint-disable import/first */
import { mockReset } from 'jest-mock-extended'

jest.mock('@/store/db/prisma')

import { prisma } from '@/store/db/prisma'

beforeEach(() => {
  mockReset(prisma)
})
