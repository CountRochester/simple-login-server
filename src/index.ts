/* eslint-disable import/first */
import env from 'dotenv'

env.config()

import './module-alias'
import { dbClient, DbClient, initDb } from '@/store'

console.log('ok')

const gracefulShutdown = async (
  db: DbClient,
) => {
  await db.disconnect()
  process.exit(0)
}

const start = async () => {
  try {
    console.log('Connecting to DB...')
    await dbClient.connect()
    console.log('Initialize DB...')
    await initDb(dbClient)

    console.log('Starting public API...');

    ['exit', 'SIGINT', 'SIGTERM'].forEach(code => {
      process.on(code, async () => {
        console.log('Service is shutting down gracefully')
        await gracefulShutdown(dbClient)
      })
    })
  } catch (err) {
    console.log('Startup Error:')
    console.error(err)
    await dbClient.disconnect()
    process.exit(1)
  }
}

start()
