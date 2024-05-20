import License from '#models/license'
import Project from '#models/project'
import {
  createTestLicense,
  createTestProject,
  createTestUser,
  removeTestLicense,
  removeTestProject,
  removeTestUser,
  TestUserResult,
} from '#tests/util'
import { test } from '@japa/runner'

test.group('Project update | PATCH | api/projects/:slug', async (group) => {
  let testUser: TestUserResult
  let testProject: Project
  let testLicense: License

  group.each.setup(async () => {
    testUser = await createTestUser()
    testLicense = await createTestLicense()
    testProject = await createTestProject(testUser.user, testLicense)
  })

  group.each.teardown(async () => {
    await removeTestProject(testProject.id)
    await removeTestLicense()
    await removeTestUser()
  })

  test('should can update Project', async ({ client, expect }) => {
    const response = await client
      .patch('/api/projects/' + testProject!.slug)
      .bearerToken(testUser!.token)
      .json({
        title: 'updated title',
        description: 'updated description',
        visibility: 'private',
        type: 'brance',
      })

    const body = response.body()

    expect(response.status()).toBe(200)
    expect(body.success).toBeTruthy()
    expect(body.data.id).toBe(testProject!.id)
    expect(body.data.title).toBe('updated title')
    expect(body.data.description).toBe('updated description')
    expect(body.data.visibility).toBe('private')
    expect(body.data.type).toBe('brance')
    expect(body.data.licenseId).toBe(testLicense.id)
    expect(body.message).toBe('Project updated successfully')
  })

  test('should return 404 if project not found', async ({ client, expect }) => {
    const response = await client
      .patch('/api/projects/' + 'wrong-project') // slug not found
      .bearerToken(testUser!.token)
      .json({
        title: 'updated title',
        description: 'updated description',
        visibility: 'private',
      })

    expect(response.status()).toBe(404)
    expect(response.body().message).toBe('Project not found')
  })

  test('should return 401 if token is wrong', async ({ client, expect }) => {
    const response = await client
      .patch('/api/projects/' + testProject!.slug)
      .bearerToken('wrong token')
      .json({
        title: 'updated title',
        description: 'updated description',
        visibility: 'private',
      })

    expect(response.status()).toBe(401)
    expect(response.body().errors).toBeDefined()
  })

  test('should return 422 if data is invalid', async ({ client, expect }) => {
    const response = await client
      .patch('/api/projects/' + testProject!.slug)
      .bearerToken(testUser!.token)
      .json({
        title: '',
        visibility: 'invalid-visibility',
        type: 'invalid-type',
      })

    const body = response.body()
    // console.log(body)
    // errors: [
    //   {
    //     message: 'The title field must be defined',
    //     rule: 'required',
    //     field: 'title'
    //   },
    //   {
    //     message: 'The selected type is invalid',
    //     rule: 'enum',
    //     field: 'type',
    //     meta: [Object]
    //   },
    //   {
    //     message: 'The selected visibility is invalid',
    //     rule: 'enum',
    //     field: 'visibility',
    //     meta: [Object]
    //   }
    // ]

    expect(response.status()).toBe(422)
    expect(body.errors).toBeDefined()
    expect(body.errors).toContainEqual({
      message: 'The title field must be defined',
      rule: 'required',
      field: 'title',
    })
    // expect(body.errors).toContainEqual({
    //   message: 'The selected type is invalid',
    //   rule: 'enum',
    //   field: 'type',
    // })
    // expect(body.errors).toContainEqual({
    //   message: 'The selected visibility is invalid',
    //   rule: 'enum',
    //   field: 'visibility',
    // })
  })
})
