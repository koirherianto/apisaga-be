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
  'Sidebar Separators Update API | PUT | api/projects/:projectSlug/version/:version/sidebar-separator/:separatorSlug',
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

    test('Should update sidebar separator with valid data', async ({ client, expect }) => {
      const updateData = {
        name: 'Updated Separator',
        order: 2,
      }

      const response = await client
        .put(
          `/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator/${testSidebarSeparator.slug}`
        )
        .bearerToken(testUser.token)
        .json(updateData)

      expect(response.status()).toBe(200)
      expect(response.body().success).toBeTruthy()
      expect(response.body().data.name).toBe(updateData.name)
      expect(response.body().data.order).toBe(updateData.order)
      expect(response.body().data.versionId).toBe(testVersion.id)
      expect(response.body().message).toBeDefined()
    })

    // test('Should reject update if slug is not unique', async ({ client, expect }) => {
    //   // Create another sidebar separator to test unique slug
    //   const anotherSeparator = await createTestSidebarSeparator(testVersion, 'Another Separator')

    //   const updateData = {
    //     name: anotherSeparator.name,
    //   }

    //   const response = await client
    //     .put(
    //       `/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator/${testSidebarSeparator.slug}`
    //     )
    //     .bearerToken(testUser.token)
    //     .json(updateData)

    //   console.log(response.body())

    //   expect(response.status()).toBe(409)
    //   expect(response.body().message).toBeDefined()

    //   // Clean up
    //   await removeTestSidebarSeparator(anotherSeparator.id)
    // })

    test('Should reject update with invalid data', async ({ client, expect }) => {
      const response = await client
        .put(
          `/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator/${testSidebarSeparator.slug}`
        )
        .bearerToken(testUser.token)
        .json({
          name: '',
          order: 0,
        })

      expect(response.status()).toBe(422)
      expect(response.body().errors).toBeDefined()
    })

    test('Should reject if project slug is wrong', async ({ client, expect }) => {
      const response = await client
        .put(
          `/api/projects/wrong-slug/version/${testVersion.name}/sidebar-separator/${testSidebarSeparator.slug}`
        )
        .bearerToken(testUser.token)
        .json({
          name: 'Updated Separator',
          order: 2,
        })

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if version name is wrong', async ({ client, expect }) => {
      const response = await client
        .put(
          `/api/projects/${testProject.slug}/version/wrong-version/sidebar-separator/${testSidebarSeparator.slug}`
        )
        .bearerToken(testUser.token)
        .json({
          name: 'Updated Separator',
          order: 2,
        })

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if sidebar separator slug is wrong', async ({ client, expect }) => {
      const response = await client
        .put(
          `/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator/wrong-slug`
        )
        .bearerToken(testUser.token)
        .json({
          name: 'Updated Separator',
          order: 2,
        })

      expect(response.status()).toBe(404)
      expect(response.body().message).toBeDefined()
    })

    test('Should reject if token is wrong', async ({ client, expect }) => {
      const response = await client
        .put(
          `/api/projects/${testProject.slug}/version/${testVersion.name}/sidebar-separator/${testSidebarSeparator.slug}`
        )
        .bearerToken('wrong token')
        .json({
          name: 'Updated Separator',
          order: 2,
        })

      expect(response.status()).toBe(401)
      expect(response.body().errors).toBeDefined()
    })
  }
)
