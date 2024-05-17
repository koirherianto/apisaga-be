import type { HttpContext } from '@adonisjs/core/http'

export default class VersionsController {
  // /project/:slug/version
  async index({ auth, params, response }: HttpContext) {
    const project = await auth.user!.related('projects').query().where('slug', params.slug).first()

    if (!project) {
      return response.status(404).json({
        success: false,
        messages: 'Data not found',
      })
    }

    const versions = await project!.related('versions').query()

    return response.ok({
      success: true,
      data: versions,
      messages: 'Data fetched successfully',
    })
  }

  // /projects/:slug/version/:version
  async show({ auth, params, response }: HttpContext) {
    const project = await auth.user!.related('projects').query().where('slug', params.slug).first()

    if (!project) {
      return response.status(404).json({
        success: false,
        messages: 'Data not found',
      })
    }

    const version = await project!.related('versions').query().where('name', params.version).first()

    return response.ok({
      success: true,
      data: version,
      messages: 'Data fetched successfully',
    })
  }

  // /projects/:slug/version
  async store({ auth, request, params, response }: HttpContext) {
    const project = await auth.user!.related('projects').query().where('slug', params.slug).first()

    if (!project) {
      return response.status(404).json({
        success: false,
        messages: 'Data not found',
      })
    }

    const data = request.only(['name', 'isDefault', 'versionStatus', 'visibility', 'projectId'])
    data.projectId = project.id

    const hasSameName = await project.related('versions').query().where('name', data.name).first()

    if (hasSameName) {
      return response.status(400).json({
        success: false,
        messages: 'Version name already exists',
      })
    }

    const version = await project!.related('versions').create(data)

    return response.created({
      success: true,
      data: version,
      messages: 'Data created successfully',
    })
  }

  // /projects/:slug/version/:version
  async update({ auth, request, params, response }: HttpContext) {
    const project = await auth.user!.related('projects').query().where('slug', params.slug).first()

    if (!project) {
      return response.status(404).json({
        success: false,
        messages: 'Data not found',
      })
    }

    const version = await project!.related('versions').query().where('name', params.version).first()

    if (!version) {
      return response.status(404).json({
        success: false,
        messages: 'Data not found',
      })
    }

    const data = request.only(['name', 'isDefault', 'versionStatus', 'visibility'])

    if (data.name) {
      const hasSameName = await project.related('versions').query().where('name', data.name).first()
      // kecuai jika versi yang diupdate adalah versi yang sama
      if (hasSameName && hasSameName.id !== version.id) {
        return response.status(400).json({
          success: false,
          messages: 'Version name already exists',
        })
      }
    }

    version.merge(data)
    await version.save()

    return response.status(200).json({
      success: true,
      data: version,
      messages: 'Data updated successfully',
    })
  }

  // /projects/:slug/version/:version
  async destroy({ auth, params, response }: HttpContext) {
    const project = await auth.user!.related('projects').query().where('slug', params.slug).first()

    if (!project) {
      return response.status(404).json({
        success: false,
        messages: 'Data not found',
      })
    }

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
