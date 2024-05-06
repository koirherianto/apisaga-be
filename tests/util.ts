import User from '#models/user'

export const removeTestUser = async () => {
  const user = await User.findBy('email', 'test@test.com')

  user ? user.delete() : null
}
