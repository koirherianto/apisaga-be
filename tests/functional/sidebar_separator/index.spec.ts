import License from '#models/license'
import Project from '#models/project'
import Version from '#models/version'
import SidebarSeparator from '#models/sidebar_separator'
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
  createTestSidebarSeparator,
  removeTestSidebarSeparator,
} from '#tests/util'
import { test } from '@japa/runner'

test.group(
  'Sidebar Separators Index API | GET | api/projects/:projectSlug/version/:version/sidebar-separator',
  async (group) => {
    let testUser: TestUserResult
    let testLicense: License
    let testProject: Project
    let testVersion: Version
    let testSeparator: SidebarSeparator

    group.each.setup(async () => {
      testUser = await createTestUser()
      testLicense = await createTestLicense()
      testProject = await createTestProject(testUser.user, testLicense)
      testVersion = await createTestVersion(testProject)
      testSeparator = await createTestSidebarSeparator(testVersion)
    })

    group.each.teardown(async () => {
      await removeTestSidebarSeparator(testSeparator.id)
      await removeTestVersion(testVersion.id)
      await removeTestProject(testProject.id)
      await removeTestLicense()
      await removeTestUser()
    })

    test('Should return all sidebar separators', async ({ client, expect }) => {
      const response = await client
        .get(`/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator`)
        .bearerToken(testUser!.token)

      expect(response.status()).toBe(200)
      expect(response.body().success).toBeTruthy()
      expect(response.body().data.length).toBeGreaterThan(0)
      expect(response.body().message).toBe('Sidebar Separators fetched successfully')
    })

    test('Should reject if project slug is wrong', async ({ client, expect }) => {
      const response = await client
        .get('/api/projects/wrong-slug/version/' + testVersion.name + '/sidebar-separator')
        .bearerToken(testUser!.token)

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if version name is wrong', async ({ client, expect }) => {
      const response = await client
        .get('/api/projects/' + testProject.slug + '/version/wrong-version/sidebar-separator')
        .bearerToken(testUser!.token)

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if token is wrong', async ({ client, expect }) => {
      const response = await client
        .get(`/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator`)
        .bearerToken('wrong token!')

      expect(response.status()).toBe(401)
      expect(response.body().errors).toBeDefined()
    })
  }
)
