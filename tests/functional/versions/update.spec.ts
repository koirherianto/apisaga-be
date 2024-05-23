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
  'Versions Update API | PUT | api/projects/:projectSlug/version/:versionId',
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
      await removeTestVersion(testVersion.id)
      await removeTestProject(testProject.id)
      await removeTestLicense()
      await removeTestUser()
    })

    test('should update version details', async ({ client, expect }) => {
      const response = await client
        .put(`/api/projects/${testProject.slug}/version/${testVersion.name}`)
        .bearerToken(testUser!.token)
        .json({
          name: '0.0.6',
          isDefault: false,
          visibility: 'private',
          versionStatus: 'minor',
        })

      const body = response.body()

      expect(response.status()).toBe(200)
      expect(body.success).toBeTruthy()
      expect(body.data.id).toBe(testVersion.id)
      expect(body.data.name).toBe('0.0.6')
      expect(body.data.isDefault).toBe(false)
      expect(body.data.visibility).toBe('private')
      expect(body.data.versionStatus).toBe('minor')
      expect(body.message).toBe('Version updated successfully')
    })

    test('should return 404 if version not found', async ({ client, expect }) => {
      const response = await client
        .put(`/api/projects/${testProject.slug}/version/f47ac10b-58cc-4372-a567-0e02b2c3d479`) // invalid UUID
        .bearerToken(testUser!.token)
        .json({
          name: '0.0.6',
          isDefault: false,
          visibility: 'private',
          versionStatus: 'minor',
        })

      expect(response.status()).toBe(404)
      expect(response.body().message).toBe('Version not found')
    })

    test('should return 404 if project not found', async ({ client, expect }) => {
      const response = await client
        .put(`/api/projects/wrong-slug/version/${testVersion.id}`)
        .bearerToken(testUser!.token)
        .json({
          name: '0.0.6',
          isDefault: false,
          visibility: 'private',
          versionStatus: 'minor',
        })

      expect(response.status()).toBe(404)
      expect(response.body().message).toBe('Project not found')
    })

    test('should return 401 if token is wrong', async ({ client, expect }) => {
      const response = await client
        .put(`/api/projects/${testProject.slug}/version/${testVersion.id}`)
        .bearerToken('wrong token')
        .json({
          name: '0.0.6',
          isDefault: false,
          visibility: 'private',
          versionStatus: 'minor',
        })

      expect(response.status()).toBe(401)
      expect(response.body().errors).toBeDefined()
    })

    test('should return 422 if data is invalid', async ({ client, expect }) => {
      const response = await client
        .put(`/api/projects/${testProject.slug}/version/${testVersion.id}`)
        .bearerToken(testUser!.token)
        .json({
          name: '',
          isDefault: 'no in boolean',
          visibility: 'no in enum',
          versionStatus: 'no in enum',
        })

      expect(response.status()).toBe(422)
      expect(response.body().errors).toBeDefined()
    })
  }
)
