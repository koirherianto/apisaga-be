import License from '#models/license'
import {
  createTestLicense,
  createTestUser,
  removeTestLicense,
  removeTestProject,
  removeTestUser,
  TestUserResult,
} from '#tests/util'
import { test } from '@japa/runner'

test.group('Projects Create API | POST | api/projects', async (group) => {
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
  test('Create an Project', async ({ client, expect }) => {
    const response = await client.post('/api/projects').bearerToken(testUser!.token).json({
      licenseId: testLicense.id,
      title: 'test',
      type: 'version',
      visibility: 'public',
      description: 'test',
    })

    const body = response.body()

    expect(response.status()).toBe(201)
    expect(body.data.title).toBe('test')
    expect(body.data.id).toBeDefined()
    expect(body.message).toBe('Project created successfully')

    await removeTestProject(body.data.id)
  })
  test('Reject if token is wrong', async ({ client, expect }) => {
    const response = await client.post('/api/projects').bearerToken('wrong token').json({
      licenseId: testLicense.id,
      title: 'test',
      type: 'version',
      visibility: 'public',
      description: 'test',
    })

    const body = response.body()

    expect(response.status()).toBe(401)
    expect(body.errors).toBeDefined()
  })

  test('Reject if data invalid', async ({ client, expect }) => {
    const response = await client.post('/api/projects').bearerToken(testUser!.token).json({
      licenseId: 'wrong license id',
      title: '',
      type: 'no in enum',
      visibility: 'no in enum',
      description: '-',
    })

    const body = response.body()

    expect(response.status()).toBe(422)
    expect(body.errors).toBeDefined()

    expect(body.errors).toContainEqual({
      message: 'The licenseId field must be a valid UUID',
      rule: 'uuid',
      field: 'licenseId',
    })
  })
})
