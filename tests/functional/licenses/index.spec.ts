import { createTestLicense, createTestUser, removeTestLicense, removeTestUser, TestUserResult } from '#tests/util'
import { test } from '@japa/runner'

test.group('Licenses index API | GET | api/licenses', async (group) => {
  let testUser: TestUserResult

  group.each.setup(async () => {
    testUser = await createTestUser()
    await createTestLicense()
  })

  group.each.teardown(async () => {
    await removeTestLicense()
    await removeTestUser()
  })

  test('should return all licenses', async ({ client, expect }) => {
    const response = await client.get('/api/licenses')
      .bearerToken(testUser!.token)

    expect(response.status()).toBe(200)
    expect(response.body().success).toBeTruthy()
    expect(response.body().data.length).toBeGreaterThan(0)
    expect(response.body().message).toBeDefined()
  })

  test('should return 401 if token is wrong', async ({ client, expect }) => {
    const response = await client.get('/api/licenses')
      .bearerToken('wrong token!')

    expect(response.status()).toBe(401)
    expect(response.body().errors).toBeDefined()
  })
})