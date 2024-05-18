import { createTestUser, removeTestUser } from '#tests/util'
import { test } from '@japa/runner'

test.group('Register API | POST | api/register', () => {
  test('Create an account', async ({ client, expect }) => {
    const response = await client.post('/api/register').json({
      name: 'test',
      email: 'test@test.com',
      username: 'test',
      password: '123456',
    })

    expect(response.status()).toBe(201)
    expect(response.body().success).toBeTruthy()
    expect(response.body().data.name).toBe('test')
    expect(response.body().data.email).toBe('test@test.com')
    expect(response.body().data.username).toBe('test')
    expect(response.body().token).toHaveProperty('token')
    expect(response.body().message).toBe('User created successfully')

    await removeTestUser()
  })

  test('should reject if email already registered', async ({ client, expect }) => {
    await createTestUser()
    const userData = {
      name: 'test',
      email: 'test@test.com',
      username: 'test',
      password: '123456',
    }

    const response = await client.post('/api/register').json(userData)

    expect(response.status()).toBe(400)
    expect(response.body().success).toBeFalsy()
    expect(response.body().message).toBe('Email already registered')

    await removeTestUser()
  })

  test('should reject if username already registered', async ({ client, expect }) => {
    await createTestUser()
    const userData = {
      name: 'test',
      email: 'test2@test.com',
      username: 'test',
      password: '123456',
    }

    const response = await client.post('/api/register').json(userData)

    expect(response.status()).toBe(400)
    expect(response.body().success).toBeFalsy()
    expect(response.body().message).toBe('Username already registered')
    await removeTestUser()
  })

  test('should reject if request is invalid', async ({ client, expect }) => {
    const userData = {
      name: '',
      email: '',
      username: '',
      password: '',
    }

    const response = await client.post('/api/register').json(userData)

    expect(response.status()).toBe(422)
    const errors = response.body().errors

    expect(errors[0]['message']).toBe('The name field must be defined')
    expect(errors[0]['rule']).toBe('required')
    expect(errors[0]['field']).toBe('name')

    expect(errors).toBeDefined()
  })
})
