import Version from '#models/version'
import { Authenticator } from '@adonisjs/auth'
import { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import ResponseError from '#exceptions/respon_error_exception'
import TopBar from '#models/top_bar'

export default class TopBarsController {
  // projects/:projectSlug/version/:version/top-bar/:topBarSlug
  async getLeftbar({ auth, params, response }: HttpContext) {
    // const version = await this.checkVersionMustExist(auth, params.projectSlug, params.version)
    const topBar = await this.checkTopBarMustExist(
      auth,
      params.projectSlug,
      params.version,
      params.topBarSlug
    )

    const leftbars = await topBar.related('sidebarItems').query()

    return response.ok({
      success: true,
      data: leftbars,
      message: 'leftbars fetched successfully',
    })
  }

  private async checkTopBarMustExist(
    auth: Authenticator<Authenticators>,
    projectSlug: string,
    versionName: string,
    topBarSlug: string
  ): Promise<TopBar> {
    const project = await auth.user!.related('projects').query().where('slug', projectSlug).first()
    if (!project) {
      throw new ResponseError('Project not found', { status: 404 })
    }

    const version = await project.related('versions').query().where('name', versionName).first()
    if (!version) {
      throw new ResponseError('Version not found', { status: 404 })
    }

    const topBar = await version.related('topBars').query().where('slug', topBarSlug).first()
    if (!topBar) {
      throw new ResponseError('Top Bar not found', { status: 404 })
    }

    return topBar
  }

  private async checkVersionMustExist(
    auth: Authenticator<Authenticators>,
    projectSlug: string,
    versionName: string
  ): Promise<Version> {
    const project = await auth.user!.related('projects').query().where('slug', projectSlug).first()
    if (!project) {
      throw new ResponseError('Project not found', { status: 404 })
    }

    const version = await project.related('versions').query().where('name', versionName).first()
    if (!version) {
      throw new ResponseError('Version not found', { status: 404 })
    }

    return version
  }
}
