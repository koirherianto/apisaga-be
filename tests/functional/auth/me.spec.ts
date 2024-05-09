import { createTestUser, removeTestUser, TestUserResult } from '#tests/util'
import { test } from '@japa/runner'

test.group('Me API | GET | /api/me', (group) => {
  let testUser: TestUserResult | null = null
  group.setup(async () => {
    testUser = await createTestUser()
  })

  group.teardown(async () => {
    await removeTestUser()
  })

  test('Get user data', async ({ client, expect }) => {
    const response = await client.get('/api/me').bearerToken(testUser!.token)

    const body = response.body()

    expect(response.status()).toBe(200)
    expect(body.success).toBeTruthy()
    expect(body.data.id).toBe(testUser!.user.id)
    expect(body.data.name).toBe('test')
    expect(body.data.email).toBe('test@test.com')
    expect(body.data.username).toBe('test')
    expect(body.message).toBe('User data')
  })

  test('should reject if token is invalid', async ({ client, expect }) => {
    const response = await client.get('/api/me').bearerToken('salah token')

    console.log(response.body())
    expect(response.status()).toBe(401)
    expect(response.body().errors).toBeDefined()
  })
})
