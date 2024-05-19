import { createVersionValidator, updateVersionValidator } from '#validators/version'
import { Authenticator } from '@adonisjs/auth'
import { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import ResponseError from '#exceptions/respon_error_exception'
import Project from '#models/project'

export default class VersionsController {
  // /project/:slug/version
  async index({ auth, params, response }: HttpContext) {
    // throw new ResponseError('Projects not found', { status: 400 })
    const project = await this.checkProjectMustExist(auth, params.slug)
    const versions = await project!.related('versions').query()

    return response.ok({
      success: true,
      data: versions,
      messages: 'Data fetched successfully',
    })
  }

  // /projects/:slug/version/:version
  async show({ auth, params, response }: HttpContext) {
    const project = await this.checkProjectMustExist(auth, params.slug)
    const version = await project!.related('versions').query().where('name', params.version).first()

    return response.ok({
      success: true,
      data: version,
      messages: 'Data fetched successfully',
    })
  }

  // /projects/:slug/version
  async store({ auth, request, params, response }: HttpContext) {
    const validate = await request.validateUsing(createVersionValidator)
    const project = await this.checkProjectMustExist(auth, params.slug)
    const isSame = await project.related('versions').query().where('name', validate.name).first()

    if (isSame) {
      return response.status(400).json({
        success: false,
        messages: 'Version name already exists',
      })
    }

    const version = await project!
      .related('versions')
      .create({ ...validate, projectId: project.id })

    return response.created({
      success: true,
      data: version,
      messages: 'Data created successfully',
    })
  }

  // /projects/:slug/version/:version
  async update({ auth, request, params, response }: HttpContext) {
    const validate = await request.validateUsing(updateVersionValidator)
    const project = await this.checkProjectMustExist(auth, params.slug)

    const version = await project!.related('versions').query().where('name', params.version).first()

    if (!version) {
      return response.status(404).json({
        success: false,
        messages: 'Data not found',
      })
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
    const version = await project!.related('versions').query().where('name', params.version).first()

    if (!version) {
      return response.status(404).json({
        success: false,
        messages: 'Data not found',
      })
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

  isSemanticVersion(version: string): boolean {
    const semverRegex = new RegExp(
      '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)' + // MAJOR.MINOR.PATCH
        '(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)' + // Pre-release
        '(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?' + // (more pre-release)
        '(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$' // Build metadata
    )

    return semverRegex.test(version)
  }
}
