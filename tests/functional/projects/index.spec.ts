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

test.group('Projects Create API | GET | api/projects', async (group) => {
  let testUser: TestUserResult
  let testLicense: License
  let testProject: Project

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

  test('Should return all project', async ({ client, expect }) => {
    const response = await client.get('/api/projects').bearerToken(testUser!.token)

    expect(response.status()).toBe(200)
    expect(response.body().success).toBeTruthy()
    expect(response.body().data.length).toBeGreaterThan(0)
    expect(response.body().message).toBeDefined()
  })

  test('Should reject if token is wrong', async ({ client, expect }) => {
    const response = await client.get('/api/projects').bearerToken('wrong token!')

    expect(response.status()).toBe(401)
    expect(response.body().errors).toBeDefined()
  })
})
