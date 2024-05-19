import License from '#models/license'
import { createTestLicense, createTestUser, removeTestLicense, removeTestUser, TestUserResult } from '#tests/util'
import { test } from '@japa/runner'

test.group('Licenses show | GET | api/licenses/:id', async (group) => {
  let testUser: TestUserResult
  let testLicense: License

  group.each.setup(async () => {
    testUser = await createTestUser()
    testLicense = await createTestLicense()
  })

  group.each.teardown(async () => {
    await removeTestLicense()
    await removeTestUser()
  })
  test('should can get Licnese', async ({ client, expect }) => {
    const response = await client.get('/api/licenses/' + testLicense!.id)
      .bearerToken(testUser!.token)

    const body = response.body()

    expect(response.status()).toBe(200)
    expect(body.success).toBeTruthy()
    expect(body.data.id).toBeDefined()
    expect(body.data.name).toBe('test license')
    expect(body.message).toBe('Get license data successfully')
  })

  test('should return 422 if license not found', async ({ client, expect }) => {
    const response = await client.get('/api/licenses/' + '1234-1234-1234-1234') // invalid uuid
      .bearerToken(testUser!.token)

    expect(response.status()).toBe(422)
    expect(response.body().errors).toBeDefined()
  })

  test('should return 401 if token is wrong', async ({ client, expect }) => {
    const response = await client.get('/api/licenses/' + testLicense!.id)
      .bearerToken('wrong token')

    expect(response.status()).toBe(401)
    expect(response.body().errors).toBeDefined()
  })

})