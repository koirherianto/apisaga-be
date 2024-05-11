import License from '#models/license'
import { createTestLicense, createTestUser, removeTestLicense, removeTestUser, TestUserResult } from '#tests/util'
import { test } from '@japa/runner'

test.group('Licenses Update API | PUT | api/licenses', async (group) => {
  let testUser: TestUserResult | null = null
  let testLicense: License | null = null

  group.each.setup(async () => {
    testUser = await createTestUser()
    testLicense = await createTestLicense()
  })

  group.each.teardown(async () => {
    await removeTestLicense()
    await removeTestUser()
  })
  test('Update an licenses', async ({ client, expect }) => {
    const response = await client.put('/api/licenses/' + testLicense?.id)
      .bearerToken(testUser!.token)
      .json({name: 'test license'})

    const body = response.body()

    expect(response.status()).toBe(200)
    expect(body.success).toBeTruthy()
    expect(body.data.id).toBeDefined()
    expect(body.data.name).toBe('test license')
    expect(body.message).toBe('License updated successfully')
  })

  test('should return 422 if license not found', async ({ client, expect }) => {
    const response = await client.put('/api/licenses/' + '1234-1234-1234-1234') // invalid uuid
      .bearerToken(testUser!.token)
      .json({name: 'test license'})

    expect(response.status()).toBe(422)
    expect(response.body().errors).toBeDefined()
  })

  test('Reject if name is empty', async ({ client, expect }) => {
    const response = await client.put('/api/licenses/' + testLicense?.id)
      .bearerToken(testUser!.token)
      .json({name: ''})

    expect(response.status()).toBe(422)
    expect(response.body().errors).toBeDefined()
  })

  test('Reject if token is wrong', async ({ client, expect }) => {
    const response = await client.put('/api/licenses/' + testLicense?.id)
      .bearerToken('wrong token')
      .json({name: 'test licens'})
    
    const body = response.body()

    expect(response.status()).toBe(401)
    expect(body.errors).toBeDefined()
  })

})