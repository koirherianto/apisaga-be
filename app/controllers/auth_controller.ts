import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const validate = await request.validateUsing(registerValidator)

    const isEmailExist = await User.findBy('email', validate.email)

    if (isEmailExist) {
      return response.badRequest({
        success: false,
        message: 'Email already exist',
      })
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

    return response.badRequest({
      success: false,
      message: 'Email already exist',
    })
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.findBy('email', email)

    if (!user || user === null) {
      return response.status(400).json({
        success: false,
        message: 'Invalid email or passwordd',
      })
    }

    const isVerify = await hash.verify(user!.password, password)

    if (isVerify) {
      const token = await User.accessTokens.create(user!)

      return response.status(200).json({
        success: true,
        data: user,
        token: token,
        message: 'Login successfully',
      })
    }

    return response.status(401).json({
      success: false,
      message: 'Invalid email or password',
    })
  }

  async me({ auth, response }: HttpContext) {
    const user = auth.user!

    return response.status(200).json({
      success: true,
      data: user,
      message: 'User data',
    })
  }

  async logout({ auth, response }: HttpContext) {
    const getUser = auth.user?.id
    const user = await User.findOrFail(getUser)
    const token = auth.user?.currentAccessToken.identifier

    if (!token) {
      return response.badRequest({
        success: false,
        message: 'Token not found',
      })
    }
    await User.accessTokens.delete(user, token)

    return response.ok({
      success: true,
      message: 'User logged out',
      data: getUser,
    })
  }
}
