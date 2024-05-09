import { createTestUser, removeTestUser, TestUserResult } from '#tests/util'
import { test } from '@japa/runner'

test.group('Logout API | DELETE | /api/logout', (group) => {
  let testUser: TestUserResult | null = null
  group.setup(async () => {
    testUser = await createTestUser()
  })

  group.teardown(async () => {
    await removeTestUser()
  })

  test('Logout user', async ({ client, expect }) => {
    const response = await client.delete('/api/logout').bearerToken(testUser!.token)

    const body = response.body()

    expect(response.status()).toBe(200)
    expect(body.success).toBeTruthy()
    expect(body.message).toBe('Logout successfully')
    expect(body.userId).toBeDefined()
  })

  test('should reject if token is invalid', async ({ client, expect }) => {
    const response = await client.delete('/api/logout').bearerToken('salah token')

    expect(response.status()).toBe(401)
    expect(response.body().errors).toBeDefined()
  })
})
