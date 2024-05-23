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

test.group('Versions Create API | POST | api/projects/:projectSlug/version', async (group) => {
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

  test('Create an Version', async ({ client, expect }) => {
    const response = await client
      .post(`/api/projects/${testProject.slug}/version`)
      .bearerToken(testUser!.token)
      .json({
        projectId: testProject.id,
        name: '0.0.5',
        isDefault: true,
        visibility: 'public',
        versionStatus: 'patch',
      })

    const body = response.body()

    expect(response.status()).toBe(201)
    expect(body.data.id).toBeDefined()
    expect(body.data.name).toBe('0.0.5')
    expect(body.data.isDefault).toBe(true)
    expect(body.data.visibility).toBe('public')
    expect(body.data.versionStatus).toBe('patch')
    expect(body.message).toBe('Version created successfully')

    await removeTestVersion(body.data.id)
  })

  test('Reject if name already exists', async ({ client, expect }) => {
    const response = await client
      .post(`/api/projects/${testProject.slug}/version`)
      .bearerToken(testUser!.token)
      .json({
        projectId: testProject.id,
        name: testVersion.name,
        isDefault: true,
        visibility: 'public',
        versionStatus: 'patch',
      })

    const body = response.body()

    expect(response.status()).toBe(409)
    expect(body.message).toBeDefined()
  })

  test('Reject if data invalid', async ({ client, expect }) => {
    const response = await client
      .post(`/api/projects/${testProject.slug}/version`)
      .bearerToken(testUser!.token)
      .json({
        projectId: 'wrong project id',
        name: '',
        isDefault: 'no in boolean',
        visibility: 'no in enum',
        versionStatus: 'no in enum',
      })

    const body = response.body()

    expect(response.status()).toBe(422)
    expect(body.errors).toBeDefined()
  })

  test('Reject if token is wrong', async ({ client, expect }) => {
    const response = await client
      .post(`/api/projects/${testProject.slug}/version`)
      .bearerToken('wrong token')
      .json({
        projectId: testProject.id,
        name: '0.0.5',
        isDefault: true,
        visibility: 'public',
        versionStatus: 'patch',
      })

    const body = response.body()

    expect(response.status()).toBe(401)
    expect(body.errors).toBeDefined()
  })
})
