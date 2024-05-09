import { createTestUser, removeTestUser } from '#tests/util'
import { test } from '@japa/runner'

test.group('Login API | POST | /api/register', (group) => {
  group.setup(async () => {
    await createTestUser()
  })

  group.teardown(async () => {
    await removeTestUser()
  })

  test('Login account', async ({ client, expect }) => {
    const response = await client.post('/api/login').json({
      email: 'test@test.com',
      password: '123456',
    })

    expect(response.status()).toBe(200)
    expect(response.body().success).toBeTruthy()
    expect(response.body().data.id).toBeDefined()
    expect(response.body().data.name).toBe('test')
    expect(response.body().data.email).toBe('test@test.com')
    expect(response.body().data.username).toBe('test')
    expect(response.body().token).toHaveProperty('token')
    expect(response.body().message).toBe('Login successfully')
    expect(response.body().message).toBe('Login successfully')
  })

  test('should reject if email or password is invalid', async ({ client, expect }) => {
    const response = await client.post('/api/login').json({
      email: '',
      password: '',
    })

    expect(response.status()).toBe(422)
    expect(response.body().errors).toBeDefined()
  })

  // should reject login if password is wrong
  test('should reject if password is wrong', async ({ client, expect }) => {
    const response = await client.post('/api/login').json({
      email: 'test@test.com',
      password: 'salah',
    })

    console.log(response.body())

    expect(response.status()).toBe(401)
    expect(response.body().success).toBeFalsy()
    expect(response.body().message).toBe('Invalid email or password')
  })
  test('should reject if email is wrong', async ({ client, expect }) => {
    const response = await client.post('/api/login').json({
      email: 'salah@test.com',
      password: '123456',
    })

    expect(response.status()).toBe(401)
    expect(response.body().success).toBeFalsy()
    expect(response.body().message).toBe('Invalid email or password')
  })
})
