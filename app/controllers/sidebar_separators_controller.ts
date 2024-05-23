import type { HttpContext } from '@adonisjs/core/http'
import Version from '#models/version'
import SidebarSeparator from '#models/sidebar_separator'
import ResponseError from '#exceptions/respon_error_exception'
import { Authenticator } from '@adonisjs/auth'
import { Authenticators } from '@adonisjs/auth/types'
import {
  createSidebarSeparatorValidator,
  updateSidebarSeparatorValidator,
} from '#validators/sidebar_separator'

export default class SidebarSeparatorsController {
  async index({ auth, params, response }: HttpContext) {
    const version = await this.checkVersionMustExist(auth, params.projectSlug, params.version)
    const separators = await version.related('sidebarSeparator').query().preload('sidebarItems')

    return response.ok({
      success: true,
      data: separators,
      message: 'Sidebar Separators fetched successfully',
    })
  }

  async show({ auth, params, response }: HttpContext) {
    const version = await this.checkVersionMustExist(auth, params.projectSlug, params.version)
    const separator = await this.checkSeparatorMustExist(version, params.separatorSlug)

    return response.ok({
      success: true,
      data: separator,
      message: 'Sidebar Separator fetched successfully',
    })
  }

  async store({ auth, params, request, response }: HttpContext) {
    const version = await this.checkVersionMustExist(auth, params.slug, params.version)
    const validate = await request.validateUsing(createSidebarSeparatorValidator)

    const separator = await version
      .related('sidebarSeparator')
      .create({ ...validate, versionId: version.id })

    // reordering the separators
    const separators = await version.related('sidebarSeparator').query().orderBy('order', 'asc')
    // eslint-disable-next-line unicorn/no-for-loop
    for (let i = 0; i < separators.length; i++) {
      separators[i].order = i + 1
      await separators[i].save()
    }

    return response.created({
      success: true,
      data: separator,
      message: 'Sidebar Separator created successfully',
    })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const version = await this.checkVersionMustExist(auth, params.projectSlug, params.version)
    const separator = await this.checkSeparatorMustExist(version, params.separatorSlug)
    const validate = await request.validateUsing(updateSidebarSeparatorValidator)

    separator.merge(validate)
    await separator.save()

    // reordering the separators
    const separators = await version.related('sidebarSeparator').query().orderBy('order', 'asc')
    // eslint-disable-next-line unicorn/no-for-loop
    for (let i = 0; i < separators.length; i++) {
      separators[i].order = i + 1
      await separators[i].save()
    }

    // catatan ordernya seharusnya diurutkan berdasarkan order request, kalau ini cuman menurutkan berdasarkan id

    return response.ok({
      success: true,
      data: separator,
      message: 'Sidebar Separator updated successfully',
    })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const version = await this.checkVersionMustExist(auth, params.projectSlug, params.version)
    const separator = await this.checkSeparatorMustExist(version, params.separatorSlug)

    await separator.delete()

    // reordering the separators
    const separators = await version.related('sidebarSeparator').query().orderBy('order', 'asc')
    // eslint-disable-next-line unicorn/no-for-loop
    for (let i = 0; i < separators.length; i++) {
      separators[i].order = i + 1
      await separators[i].save()
    }

    return response.ok({
      success: true,
      data: separator,
      message: 'Sidebar Separator deleted successfully',
    })
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

  private async checkSeparatorMustExist(
    version: Version,
    separatorSlug: string
  ): Promise<SidebarSeparator> {
    const separator = await version
      .related('sidebarSeparator')
      .query()
      .where('slug', separatorSlug)
      .first()
    if (!separator) {
      throw new ResponseError('Sidebar Separator not found', { status: 404 })
    }

    return separator
  }
}
