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
  removeTestSidebarItem,
} from '#tests/util'
import { test } from '@japa/runner'

test.group(
  'Sidebar Items Create API | POST | api/projects/:projectSlug/version/:version/sidebar-items',
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
    })

    group.each.teardown(async () => {
      if (testSidebarItem) {
        await removeTestSidebarItem(testSidebarItem.id)
      }
      await removeTestVersion(testVersion.id)
      await removeTestProject(testProject.id)
      await removeTestLicense()
      await removeTestUser()
    })

    test('Should create a new sidebar item', async ({ client, expect }) => {
      const response = await client
        .post(`/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-items`)
        .bearerToken(testUser.token)
        .json({
          name: 'New Sidebar Item',
          content: '# Markdown Content',
          order: 1,
          sidebarSeparatorId: null,
        })

      expect(response.status()).toBe(201)
      expect(response.body().success).toBeTruthy()
      expect(response.body().data).toBeDefined()
      expect(response.body().data.name).toBe('New Sidebar Item')
      expect(response.body().data.order).toBe(1)
      expect(response.body().data.content).toBe('# Markdown Content')
      expect(response.body().data.sidebarSeparatorId).toBeNull()
      expect(response.body().data.slug).toBeDefined()
      expect(response.body().data.versionId).toBe(testVersion.id)
      expect(response.body().message).toBeDefined()

      testSidebarItem = response.body().data
    })

    test('Should reject if wrong validate', async ({ client, expect }) => {
      const response = await client
        .post(`/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-items`)
        .bearerToken(testUser.token)
        .json({
          name: 'New',
          content: '# Markdown Content',
          order: -2,
          sidebarSeparatorId: 'wrong-uuid',
        })

      expect(response.status()).toBe(422)
      expect(response.body().errors).toBeDefined()
    })

    test('Should reject if project slug is wrong', async ({ client, expect }) => {
      const response = await client
        .post('/api/projects/wrong-slug/version/${testVersion.name}/sidebar-items')
        .bearerToken(testUser.token)
        .json({
          sidebarSeparatorId: null,
          name: 'New Sidebar Item',
          content: '# Markdown Content',
          order: 1,
        })

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if version name is wrong', async ({ client, expect }) => {
      const response = await client
        .post(`/api/projects/${testProject.slug}/version/wrong-version/sidebar-items`)
        .bearerToken(testUser.token)
        .json({
          sidebarSeparatorId: null,
          name: 'New Sidebar Item',
          content: '# Markdown Content',
          order: 1,
        })

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if token is wrong', async ({ client, expect }) => {
      const response = await client
        .post(`/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-items`)
        .bearerToken('wrong token')
        .json({
          sidebarSeparatorId: null,
          name: 'New Sidebar Item',
          content: '# Markdown Content',
          order: 1,
        })

      expect(response.status()).toBe(401)
      expect(response.body().errors).toBeDefined()
    })
  }
)
