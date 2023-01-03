import { clearDB } from '@/test/helpers.int'
import { dbClient } from '@/store/db'

describe('initial test', () => {
  beforeEach(async () => {
    await clearDB()
  })

  test('should mocks DB', async () => {
    const res = await dbClient.entity('role').count()

    expect(res).toBe(0)
  })
})
