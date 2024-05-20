import { createVersionValidator, updateVersionValidator } from '#validators/version'
import { Authenticator } from '@adonisjs/auth'
import { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import ResponseError from '#exceptions/respon_error_exception'
import Project from '#models/project'

export default class VersionsController {
  // /project/:slug/version
  async index({ auth, params, response }: HttpContext) {
    const project = await this.checkProjectMustExist(auth, params.slug)
    const versions = await project!
      .related('versions')
      .query()
      .preload('sidebarSeparator')
      .preload('sidebarItem')

    return response.ok({
      success: true,
      data: versions,
      messages: 'Versions fetched successfully',
    })
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
      messages: 'Version fetched successfully',
    })
  }

  // /projects/:slug/version
  async store({ auth, request, params, response }: HttpContext) {
    const validate = await request.validateUsing(createVersionValidator)
    const project = await this.checkProjectMustExist(auth, params.slug)
    let version = await this.checkVersionExist(project, validate.name)

    if (version) {
      throw new ResponseError('Version name already exists', { status: 400 })
    }

    version = await project!.related('versions').create({ ...validate, projectId: project.id })

    return response.created({
      success: true,
      data: version,
      messages: 'Version created successfully',
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

    if (validate.name) {
      const isSame = await project.related('versions').query().where('name', validate.name).first()
      // kecuai jika versi yang diupdate adalah versi yang sama
      if (isSame && isSame.id !== version.id) {
        return response.status(400).json({
          success: false,
          messages: 'Version name already exists',
        })
      }
    }

    version.merge(validate)
    await version.save()

    return response.status(200).json({
      success: true,
      data: version,
      messages: 'Data updated successfully',
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
      messages: 'Data deleted successfully',
    })
  }

  async checkProjectMustExist(auth: Authenticator<Authenticators>, slug: string): Promise<Project> {
    const project = await auth.user!.related('projects').query().where('slug', slug).first()

    if (!project) {
      throw new ResponseError('Projects not found', { status: 404 })
    }

    return project
  }

  // apakah versi sudah ada di database
  async checkVersionExist(project: Project, version: string): Promise<any> {
    const isExist = await project
      .related('versions')
      .query()
      .preload('sidebarItem')
      .preload('sidebarSeparator')
      .where('name', version)
      .first()

    if (!isExist) {
      return false
    }

    return isExist
  }
}
