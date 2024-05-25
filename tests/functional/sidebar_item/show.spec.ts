import License from '#models/license'
import Project from '#models/project'
import Version from '#models/version'
import SidebarItem from '#models/sidebar_item'
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
  createTestSidebarItem,
  removeTestSidebarItem,
} from '#tests/util'
import { test } from '@japa/runner'

test.group(
  'Sidebar Items Show API | GET | api/projects/:projectSlug/version/:version/sidebar-items/:itemSlug',
  async (group) => {
    let testUser: TestUserResult
    let testLicense: License
    let testProject: Project
    let testVersion: Version
    let testSidebarItem: SidebarItem

    group.each.setup(async () => {
      testUser = await createTestUser()
      testLicense = await createTestLicense()
      testProject = await createTestProject(testUser.user, testLicense)
      testVersion = await createTestVersion(testProject)
      testSidebarItem = await createTestSidebarItem(testVersion)
    })

    group.each.teardown(async () => {
      await removeTestSidebarItem(testSidebarItem.id)
      await removeTestVersion(testVersion.id)
      await removeTestProject(testProject.id)
      await removeTestLicense()
      await removeTestUser()
    })

    test('Should return a single sidebar item', async ({ client, expect }) => {
      const response = await client
        .get(
          `/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-items/${testSidebarItem.slug}`
        )
        .bearerToken(testUser.token)

      expect(response.status()).toBe(200)
      expect(response.body().success).toBeTruthy()
      expect(response.body().data).toBeDefined()
      expect(response.body().data.id).toBe(testSidebarItem.id)
      expect(response.body().data.versionId).toBe(testVersion.id)
      expect(response.body().data.name).toBe(testSidebarItem.name)
      expect(response.body().data.slug).toBe(testSidebarItem.slug)
      expect(response.body().data.order).toBe(testSidebarItem.order)
      expect(response.body().data.content).toBe(testSidebarItem.content)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if project slug is wrong', async ({ client, expect }) => {
      const response = await client
        .get(
          `/api/projects/wrong-slug/version/${testVersion.name}/sidebar-items/${testSidebarItem.slug}`
        )
        .bearerToken(testUser.token)

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if version name is wrong', async ({ client, expect }) => {
      const response = await client
        .get(
          `/api/projects/${testProject.slug}/version/wrong-version/sidebar-items/${testSidebarItem.slug}`
        )
        .bearerToken(testUser.token)

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if item slug is wrong', async ({ client, expect }) => {
      const response = await client
        .get(
          `/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-items/wrong-slug`
        )
        .bearerToken(testUser.token)

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if token is wrong', async ({ client, expect }) => {
      const response = await client
        .get(
          `/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-items/${testSidebarItem.slug}`
        )
        .bearerToken('wrong token')

      expect(response.status()).toBe(401)
      expect(response.body().errors).toBeDefined()
    })
  }
)
