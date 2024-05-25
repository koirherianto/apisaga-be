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
  'Sidebar Separators Delete API | DELETE | api/projects/:projectSlug/version/:version/sidebar-separator/:separatorSlug',
  async (group) => {
    let testUser: TestUserResult
    let testLicense: License
    let testProject: Project
    let testVersion: Version
    let testSidebarSeparator: SidebarSeparator

    group.each.setup(async () => {
      testUser = await createTestUser()
      testLicense = await createTestLicense()
      testProject = await createTestProject(testUser.user, testLicense)
      testVersion = await createTestVersion(testProject)
      testSidebarSeparator = await createTestSidebarSeparator(testVersion)
    })

    group.each.teardown(async () => {
      await removeTestSidebarSeparator(testSidebarSeparator.id)
      await removeTestVersion(testVersion.id)
      await removeTestProject(testProject.id)
      await removeTestLicense()
      await removeTestUser()
    })

    test('Should delete sidebar separator with valid data', async ({ client, expect }) => {
      const response = await client
        .delete(
          `/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator/${testSidebarSeparator.slug}`
        )
        .bearerToken(testUser.token)

      expect(response.status()).toBe(200)
      expect(response.body().success).toBeTruthy()
      expect(response.body().data.id).toBe(testSidebarSeparator.id)
      expect(response.body().message).toBeDefined()

      const separatorCheck = await SidebarSeparator.find(testSidebarSeparator.id)
      expect(separatorCheck).toBeNull()
    })

    test('Should reject if project slug is wrong', async ({ client, expect }) => {
      const response = await client
        .delete(
          `/api/projects/wrong-slug/version/${testVersion.name}/sidebar-separator/${testSidebarSeparator.slug}`
        )
        .bearerToken(testUser.token)

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if version name is wrong', async ({ client, expect }) => {
      const response = await client
        .delete(
          `/api/projects/${testProject.slug}/version/wrong-version/sidebar-separator/${testSidebarSeparator.slug}`
        )
        .bearerToken(testUser.token)

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if sidebar separator slug is wrong', async ({ client, expect }) => {
      const response = await client
        .delete(
          `/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator/wrong-slug`
        )
        .bearerToken(testUser.token)

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if token is wrong', async ({ client, expect }) => {
      const response = await client
        .delete(
          `/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator/${testSidebarSeparator.slug}`
        )
        .bearerToken('wrong token')

      expect(response.status()).toBe(401)
      expect(response.body().errors).toBeDefined()
    })
  }
)
