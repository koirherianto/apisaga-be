import License from '#models/license'
import Project from '#models/project'
import {
  createTestLicense,
  createTestProject,
  createTestUser,
  removeTestLicense,
  removeTestProject,
  removeTestUser,
  TestUserResult,
} from '#tests/util'
import { test } from '@japa/runner'

test.group('Project show | GET | api/projects/:id', async (group) => {
  let testUser: TestUserResult
  let testProject: Project
  let testLicense: License

  group.each.setup(async () => {
    testUser = await createTestUser()
    testLicense = await createTestLicense()
    testProject = await createTestProject(testUser.user, testLicense)
  })

  group.each.teardown(async () => {
    await removeTestProject(testProject.id)
    await removeTestLicense()
    await removeTestUser()
  })

  test('should can get Project', async ({ client, expect }) => {
    const response = await client
      .get('/api/projects/' + testProject!.slug)
      .bearerToken(testUser!.token)

    const body = response.body()
    console.log(body)

    expect(response.status()).toBe(200)
    expect(body.success).toBeTruthy()
    expect(body.data.id).toBeDefined()
    expect(body.data.title).toBe('test')
    expect(body.data.slug).toBe('test')
    expect(body.data.type).toBe('version')
    expect(body.data.visibility).toBe('public')
    expect(body.data.description).toBe('test')
    expect(body.message).toBe('Project fetched successfully')
  })

  test('should return 404 if project not found', async ({ client, expect }) => {
    const response = await client
      .get('/api/projects/' + 'invalid-project') // project not found
      .bearerToken(testUser!.token)

    expect(response.status()).toBe(404)
  })

  test('should return 401 if token is wrong', async ({ client, expect }) => {
    const response = await client.get('/api/projects/' + testProject!.id).bearerToken('wrong token')

    expect(response.status()).toBe(401)
    expect(response.body().errors).toBeDefined()
  })
})
