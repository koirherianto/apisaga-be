import License from '#models/license'
import Project from '#models/project'
import Version from '#models/version'
import {
  TestUserResult,
  createTestUser,
  createTestLicense,
  createTestProject,
  createTestVersion,
  removeTestProject,
  removeTestLicense,
  removeTestUser,
  removeTestVersion,
} from '#tests/util'
import { test } from '@japa/runner'

test.group(
  'Versions Delete API | DELETE | api/projects/:projectSlug/version/:versionId',
  async (group) => {
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
      await removeTestProject(testProject.id)
      await removeTestLicense()
      await removeTestUser()
    })

    test('should delete version', async ({ client, expect }) => {
      const response = await client
        .delete(`/api/projects/${testProject.slug}/version/${testVersion.name}`)
        .bearerToken(testUser!.token)

      const body = response.body()

      expect(response.status()).toBe(200)
      expect(body.success).toBeTruthy()
      expect(body.data.id).toBe(testVersion.id)
      expect(body.data.name).toBe(testVersion.name)
      expect(body.data.isDefault).toBeTruthy()
      expect(body.data.visibility).toBe(testVersion.visibility)

      expect(body.message).toBe('Version deleted successfully')

      // Ensure the version is actually deleted
      const checkResponse = await client
        .get(`/api/projects/${testProject.slug}/version/${testVersion.name}`)
        .bearerToken(testUser!.token)
      expect(checkResponse.status()).toBe(404)
    })

    test('should return 404 if version not found', async ({ client, expect }) => {
      const response = await client
        .delete(`/api/projects/${testProject.slug}/version/f47ac10b-58cc-4372-a567-0e02b2c3d479`) // invalid UUID
        .bearerToken(testUser!.token)

      expect(response.status()).toBe(404)
      expect(response.body().message).toBe('Version not found')

      await removeTestVersion(testVersion.id)
    })

    test('should return 404 if project not found', async ({ client, expect }) => {
      const response = await client
        .delete(`/api/projects/wrong-slug/version/${testVersion.id}`)
        .bearerToken(testUser!.token)

      expect(response.status()).toBe(404)
      expect(response.body().message).toBe('Project not found')

      await removeTestVersion(testVersion.id)
    })

    test('should return 401 if token is wrong', async ({ client, expect }) => {
      const response = await client
        .delete(`/api/projects/${testProject.slug}/version/${testVersion.id}`)
        .bearerToken('wrong token')

      expect(response.status()).toBe(401)
      expect(response.body().errors).toBeDefined()

      await removeTestVersion(testVersion.id)
    })
  }
)
