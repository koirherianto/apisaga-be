import License from '#models/license'
import Project from '#models/project'
import Version from '#models/version'
import {
  TestUserResult,
  createTestUser,
  createTestLicense,
  createTestProject,
  removeTestProject,
  removeTestLicense,
  removeTestUser,
  createTestVersion,
  removeTestVersion,
} from '#tests/util'
import { test } from '@japa/runner'

test.group('Versions Index API | GET | api/projects', async (group) => {
  let testUser: TestUserResult
  let testLicense: License
  let testProject: Project
  let testVersion: Version

  group.each.setup(async () => {
    testUser = await createTestUser()
    testLicense = await createTestLicense()
    testProject = await createTestProject(testUser.user, testLicense)
    testVersion = await createTestVersion(testProject)
  })

  group.each.teardown(async () => {
    await removeTestVersion(testVersion.id)
    await removeTestProject(testProject.id)
    await removeTestLicense()
    await removeTestUser()
  })
  test('Should return all version', async ({ client, expect }) => {
    const response = await client
      .get('/api/projects/' + testProject.slug + '/version')
      .bearerToken(testUser!.token)

    expect(response.status()).toBe(200)
    expect(response.body().success).toBeTruthy()
    expect(response.body().data.length).toBeGreaterThan(0)
    expect(response.body().message).toBeDefined()
  })

  // reject when slug is wrong
  test('Should reject if slug is wrong', async ({ client, expect }) => {
    const response = await client
      .get('/api/projects/wrong-slug/version')
      .bearerToken(testUser!.token)
    expect(response.status()).toBe(404)
    expect(response.body().message).toBeDefined()
  })

  test('Should reject if token is wrong', async ({ client, expect }) => {
    const response = await client
      .get('/api/projects/' + testProject.slug + '/version')
      .bearerToken('wrong token!')

    expect(response.status()).toBe(401)
    expect(response.body().errors).toBeDefined()
  })
})
