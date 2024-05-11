import { test } from '@japa/runner'
import { createTestLicense, createTestUser, removeTestLicense, removeTestUser, TestUserResult } from '#tests/util'
import License from '#models/license'

test.group('Licenses delete | DELETE | api/licenses/:id', async (group) => {
  let testUser: TestUserResult | null = null
  let testLicense: License | null = null

  group.each.setup(async () => {
    testUser = await createTestUser()
    testLicense = await createTestLicense()
  })

  group.each.teardown(async () => {
    await removeTestUser()
  })
  test('Delete licenses',  async ({ client, expect }) => {
    const response = await client.delete('/api/licenses/' + testLicense?.id)
      .bearerToken(testUser!.token)

    expect(response.status()).toBe(200)
    expect(response.body().data.licenseId).toBeDefined()
    expect(response.body().message).toBe('License deleted successfully')
  })

  test('Delete Reject if id invalid', async ({ client, expect }) => {
    const response = await client.delete('/api/licenses/' + 'wrong id')
      .bearerToken(testUser!.token)

    expect(response.status()).toBe(422)
    expect(response.body().errors).toBeDefined()

    await removeTestLicense() //karna ini uji coba gagal, maka perlu dihapus manual
  })

  test('should non authrize', async ({ client, expect }) => {
    const response = await client.delete('/api/licenses/' + testLicense!.id)
      .bearerToken('wrong token')

    expect(response.status()).toBe(401)
    expect(response.body().errors).toBeDefined()

    await removeTestLicense() //karna ini uji coba gagal, maka perlu dihapus manual
  })
})