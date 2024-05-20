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

test.group('Project delete | DELETE | api/projects/:slug', async (group) => {
  let testUser: TestUserResult
  let testProject: Project
  let testLicense: License

  group.each.setup(async () => {
    testUser = await createTestUser()
    testLicense = await createTestLicense()
    testProject = await createTestProject(testUser.user, testLicense)
  })

  group.each.teardown(async () => {
    await removeTestLicense()
    await removeTestUser()
  })

  test('should can delete Project', async ({ client, expect }) => {
    const response = await client
      .delete('/api/projects/' + testProject!.slug)
      .bearerToken(testUser!.token)

    const body = response.body()

    expect(response.status()).toBe(200)
    expect(body.success).toBeTruthy()
    expect(body.data.id).toBe(testProject!.id)
    expect(body.message).toBe('Project deleted successfully')
  })

  test('should return 404 if project not found', async ({ client, expect }) => {
    const response = await client
      .delete('/api/projects/' + 'wrong-project') // slug not found
      .bearerToken(testUser!.token)

    expect(response.status()).toBe(404)
    expect(response.body().message).toBe('Project not found')

    await removeTestProject(testProject.id)
  })

  test('should return 401 if token is wrong', async ({ client, expect }) => {
    const response = await client
      .delete('/api/projects/' + testProject!.id)
      .bearerToken('wrong token')

    expect(response.status()).toBe(401)
    expect(response.body().errors).toBeDefined()

    await removeTestProject(testProject.id)
  })
})
