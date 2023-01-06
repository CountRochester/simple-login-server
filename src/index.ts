/* eslint-disable import/first */
import env from 'dotenv'

env.config()

import './module-alias'
import { dbClient, DbClient, initDb } from '@/store'
import {
  mainApi,
  ApiServer
} from '@/api'

console.log('ok')

const gracefulShutdown = async (
  db: DbClient,
  api: ApiServer,
) => {
  await db.disconnect()
  await api.stop()
}

const start = async () => {
  try {
    console.log('Connecting to DB...')
    await dbClient.connect()
    console.log('Initialize DB...')
    await initDb(dbClient)

    console.log('Starting main API...')
    await mainApi.ready()
    await mainApi.start();

    ['exit', 'SIGINT', 'SIGTERM'].forEach(code => {
      process.on(code, async () => {
        console.log('Service is shutting down gracefully')
        await gracefulShutdown(dbClient, mainApi)
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
