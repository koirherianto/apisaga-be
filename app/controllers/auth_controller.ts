import User from '#models/user'
import { registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const validate = await request.validateUsing(registerValidator)

    const isEmailExist = await User.findBy('email', validate.email)

    if (isEmailExist) {
      return response.badRequest({ message: 'Email already exist' })
    }

    const user = await User.create(validate)
    const token = await User.accessTokens.create(user)

    if (user.$isPersisted) {
      return response.status(201).json({
        success: true,
        data: user,
        token: token,
        message: 'User created successfully',
      })
    }

    return response.badRequest({ message: 'Failed to create user' })
  }
}
