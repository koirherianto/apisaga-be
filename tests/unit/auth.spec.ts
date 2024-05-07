import { TestUserResult, createTestUser, removeTestUser } from '#tests/util'
import { test } from '@japa/runner'

test.group('Register API | POST | api/register', (group) => {
  group.setup(() => {
    console.log('executed before all the test')
  })

  group.teardown(async () => {
    console.log('executed after all the test')
    await removeTestUser()
  })

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
  })

  test('should reject if email already registered', async ({ client, expect }) => {
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
  })

  test('should reject if username already registered', async ({ client, expect }) => {
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

test.group('Me API | GET | /api/me', (group) => {
  let testUser: TestUserResult | null = null
  group.setup(async () => {
    testUser = await createTestUser()
  })

  group.teardown(async () => {
    await removeTestUser()
  })

  test('Get user data', async ({ client, expect }) => {
    const response = await client.get('/api/me').bearerToken(testUser!.token)

    const body = response.body()

    expect(response.status()).toBe(200)
    expect(body.success).toBeTruthy()
    expect(body.data.id).toBe(testUser!.user.id)
    expect(body.data.name).toBe('test')
    expect(body.data.email).toBe('test@test.com')
    expect(body.data.username).toBe('test')
    expect(body.message).toBe('User data')
  })

  test('should reject if token is invalid', async ({ client, expect }) => {
    const response = await client.get('/api/me').bearerToken('salah token')

    console.log(response.body())
    expect(response.status()).toBe(401)
    expect(response.body().errors).toBeDefined()
  })
})

test.group('Logout API | DELETE | /api/logout', (group) => {
  let testUser: TestUserResult | null = null
  group.setup(async () => {
    testUser = await createTestUser()
  })

  group.teardown(async () => {
    await removeTestUser()
  })

  test('Logout user', async ({ client, expect }) => {
    const response = await client.delete('/api/logout').bearerToken(testUser!.token)

    const body = response.body()

    expect(response.status()).toBe(200)
    expect(body.success).toBeTruthy()
    expect(body.message).toBe('Logout successfully')
    expect(body.userId).toBeDefined()
  })

  test('should reject if token is invalid', async ({ client, expect }) => {
    const response = await client.delete('/api/logout').bearerToken('salah token')

    expect(response.status()).toBe(401)
    expect(response.body().errors).toBeDefined()
  })
})
