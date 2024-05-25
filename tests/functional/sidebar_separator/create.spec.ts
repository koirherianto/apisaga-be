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
  removeTestSidebarSeparator,
} from '#tests/util'
import { test } from '@japa/runner'

test.group(
  'Sidebar Separators Create API | POST | api/projects/:slug/version/:version/sidebar-separator',
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

    test('Should create a new sidebar separator', async ({ client, expect }) => {
      const response = await client
        .post(`/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator`)
        .bearerToken(testUser!.token)
        .json({
          name: 'New Separator',
          order: 1,
        })

      expect(response.status()).toBe(201)
      expect(response.body().success).toBeTruthy()
      expect(response.body().data).toBeDefined()
      expect(response.body().data.name).toBe('New Separator')
      expect(response.body().data.order).toBe(1)
      expect(response.body().data.slug).toBe('new-separator')
      expect(response.body().message).toBeDefined()

      // Cleanup
      const separatorId = response.body().data.id
      await removeTestSidebarSeparator(separatorId)
    })

    test('Should reject if name is missing', async ({ client, expect }) => {
      const response = await client
        .post(`/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator`)
        .bearerToken(testUser!.token)
        .json({ order: 1 })

      expect(response.status()).toBe(422)
      expect(response.body().errors).toBeDefined()
    })

    test('Should reject if order is missing', async ({ client, expect }) => {
      const response = await client
        .post(`/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator`)
        .bearerToken(testUser!.token)
        .json({
          name: 'New Separator',
        })

      expect(response.status()).toBe(422)
      expect(response.body().errors).toBeDefined()
    })

    test('Should reject if project slug is wrong', async ({ client, expect }) => {
      const response = await client
        .post('/api/projects/wrong-slug/version/' + testVersion.name + '/sidebar-separator')
        .bearerToken(testUser!.token)
        .json({
          name: 'New Separator',
          order: 1,
        })

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if version name is wrong', async ({ client, expect }) => {
      const response = await client
        .post('/api/projects/' + testProject.slug + '/version/wrong-version/sidebar-separator')
        .bearerToken(testUser!.token)
        .json({
          name: 'New Separator',
          order: 1,
        })

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if token is wrong', async ({ client, expect }) => {
      const response = await client
        .post(`/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator`)
        .bearerToken('wrong token!')
        .json({
          name: 'New Separator',
          order: 1,
        })

      expect(response.status()).toBe(401)
      expect(response.body().errors).toBeDefined()
    })
  }
)
