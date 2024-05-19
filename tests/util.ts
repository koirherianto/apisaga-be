import License from '#models/license'
import Project from '#models/project'
import User from '#models/user'

export interface TestUserResult {
  user: User
  token: string
}

export const removeTestUser = async () => {
  const user = await User.findBy('email', 'test@test.com')

  user ? user.delete() : null
}

export const createTestUser = async (): Promise<TestUserResult> => {
  let user: User = await User.create({
    name: 'test',
    email: 'test@test.com',
    username: 'test',
    password: '123456',
  })

  const token = await User.accessTokens.create(user)

  return {
    user: user,
    token: token.value!.release(),
  }
}

export const createTestLicense = async (): Promise<License> => {
  return await License.create({
    name: 'test license',
  })
}

export const removeTestLicense = async () => {
  const license = await License.findByOrFail('name', 'test license')

  license.delete()
}

export const createTestProject = async (user: User, license: License) => {
  return await user.related('projects').create({
    licenseId: license.id,
    title: 'test',
    type: 'version',
    visibility: 'public',
    description: 'test',
  })
}

export const removeTestProject = async (projectId: string) => {
  const project = await Project.findOrFail(projectId)
  await project.delete()
}
