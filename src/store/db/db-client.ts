import { PrismaClient } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import type { FirstCharLowerCase } from '@/types/utility'
import { prisma } from './prisma'

export class DbClient {
  private _client: PrismaClient

  transaction: PrismaClient['$transaction']

  constructor (connector: PrismaClient) {
    this._client = connector
    this.transaction = this._client.$transaction.bind(this._client)
  }

  async connect (): Promise<void> {
    await this._client.$connect()
  }

  async disconnect (): Promise<void> {
    await this._client.$disconnect()
  }

  entity<T extends FirstCharLowerCase<Prisma.ModelName>> (
    entityName: T
  ) {
    return this._client[entityName]
  }
}

export const dbClient = new DbClient(prisma)
