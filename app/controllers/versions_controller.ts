import { createVersionValidator, updateVersionValidator } from '#validators/version'
import { Authenticator } from '@adonisjs/auth'
import { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import ResponseError from '#exceptions/respon_error_exception'
import Project from '#models/project'
import Version from '#models/version'

export default class VersionsController {
  async index({ auth, params, response }: HttpContext) {
    const isLogin = await auth.check()
    if (isLogin) {
      const project = await this.checkProjectMustExist(auth, params.slug)
      const versions = await project!.related('versions').query().preload('topBars')

      return response.ok({
        success: true,
        data: versions,
        isLogin,
        message: 'Versions fetched successfully',
      })
    } else {
      const versions = await Version.query().preload('topBars')
      return response.ok({
        success: true,
        data: versions,
        isLogin,
        message: 'Versions fetched successfully',
      })
    }
  }

  // /projects/:slug/version/:version
  async show({ auth, params, response }: HttpContext) {
    const project = await this.checkProjectMustExist(auth, params.slug)
    const version = await this.checkVersionExist(project, params.version)

    if (!version) {
      throw new ResponseError('Version not found', { status: 404 })
    }

    return response.ok({
      success: true,
      data: version,
      message: 'Version fetched successfully',
    })
  }

  // /projects/:slug/version
  async store({ auth, request, params, response }: HttpContext) {
    const validate = await request.validateUsing(createVersionValidator)
    const project = await this.checkProjectMustExist(auth, params.slug)
    const checkVersion = await this.checkVersionExist(project, validate.name)

    if (checkVersion) {
      throw new ResponseError('Version name already exists', { status: 409 })
    }

    const versio = await project!.related('versions').create({ ...validate, projectId: project.id })

    if (validate.isDefault) {
      // ubah versi default yang lain menjadi false
      await project
        .related('versions')
        .query()
        .where('id', '!=', versio.id)
        .update({ isDefault: false })
    }

    return response.created({
      success: true,
      data: versio,
      message: 'Version created successfully',
    })
  }

  // /projects/:slug/version/:version
  async update({ auth, request, params, response }: HttpContext) {
    const validate = await request.validateUsing(updateVersionValidator)
    const project = await this.checkProjectMustExist(auth, params.slug)
    const version = await this.checkVersionExist(project, params.version)

    if (!version) {
      throw new ResponseError('Version not found', { status: 404 })
    }

    // jika nama versi yang diupdate sudah ada di database
    const isSame = await project.related('versions').query().where('name', validate.name).first()
    // kecuali jika versi yang diupdate adalah versi yang sama
    if (isSame && isSame.id !== version.id) {
      throw new ResponseError('Version name already exists', { status: 409 })
    }

    if (validate.isDefault) {
      // ubah versi default yang lain menjadi false
      await project
        .related('versions')
        .query()
        .where('id', '!=', version.id)
        .update({ isDefault: false })
    }

    version.merge(validate)
    await version.save()

    return response.status(200).json({
      success: true,
      data: version,
      message: 'Version updated successfully',
    })
  }

  // /projects/:slug/version/:version
  async destroy({ auth, params, response }: HttpContext) {
    const project = await this.checkProjectMustExist(auth, params.slug)
    const version = await this.checkVersionExist(project, params.version)

    if (!version) {
      throw new ResponseError('Version not found', { status: 404 })
    }

    await version.delete()

    return response.status(200).json({
      success: true,
      data: version,
      message: 'Version deleted successfully',
    })
  }

  async checkProjectMustExist(auth: Authenticator<Authenticators>, slug: string): Promise<Project> {
    const project = await auth.user!.related('projects').query().where('slug', slug).first()

    if (!project) {
      throw new ResponseError('Project not found', { status: 404 })
    }

    return project
  }

  // apakah versi sudah ada di database
  async checkVersionExist(project: Project, version: string): Promise<any> {
    const isExist = await project
      .related('versions')
      .query()
      .preload('topBars')
      .where('name', version)
      .first()

    if (!isExist) {
      return false
    }

    return isExist
  }
}
