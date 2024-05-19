import { createTestLicense, createTestUser, removeTestLicense, removeTestUser, TestUserResult } from '#tests/util'
import { test } from '@japa/runner'

test.group('Licenses Create API | POST | api/licenses', async (group) => {
  let testUser: TestUserResult

  group.each.setup(async () => {
    testUser = await createTestUser()
  })

  group.each.teardown(async () => {
    await removeTestLicense()
    await removeTestUser()
  })

  test('Create an licenses', async ({ client, expect }) => {
    const response = await client.post('/api/licenses')
      .json({name: 'test license'})
      .bearerToken(testUser!.token)

    const body = response.body()

    expect(response.status()).toBe(201)
    expect(body.data.name).toBe('test license')
    expect(body.data.id).toBeDefined()
    expect(body.message).toBe('License created successfully')
  })

  test('Reject if licese have same name', async ({ client, expect }) => {
    await createTestLicense()
    const response = await client.post('/api/licenses')
      .json({name: 'test license'})
      .bearerToken(testUser!.token)

    const body = response.body()

    expect(response.status()).toBe(422)
    expect(body.errors).toBeDefined()
  })

  test('Reject if name is empty', async ({ client, expect }) => {
    await createTestLicense() // agar bisa dihapus group.each.teardown
    const response = await client.post('/api/licenses')
      .json({name: ''})
      .bearerToken(testUser!.token)

    const body = response.body()

    expect(response.status()).toBe(422)
    expect(body.errors).toBeDefined()
  })

  test('Reject if token is wrong', async ({ client, expect }) => {
    await createTestLicense() // agar bisa dihapus group.each.teardown
    const response = await client.post('/api/licenses')
      .json({name: 'test licens'})
      .bearerToken('wrong token')
    
    const body = response.body()

    expect(response.status()).toBe(401)
    expect(body.errors).toBeDefined()
  })
})