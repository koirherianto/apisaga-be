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
