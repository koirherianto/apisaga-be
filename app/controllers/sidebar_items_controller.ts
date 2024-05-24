import type { HttpContext } from '@adonisjs/core/http'
import Version from '#models/version'
import SidebarItem from '#models/sidebar_item'
import SidebarSeparator from '#models/sidebar_separator'
import ResponseError from '#exceptions/respon_error_exception'
import { Authenticator } from '@adonisjs/auth'
import { Authenticators } from '@adonisjs/auth/types'
import { createSidebarItemValidator, updateSidebarItemValidator } from '#validators/sidebar_item'

export default class SidebarItemsController {
  async index({ auth, params, response }: HttpContext) {
    const version = await this.checkVersionMustExist(auth, params.projectSlug, params.version)
    const items = await version.related('sidebarItem').query().preload('sidebarSeparator')

    return response.ok({
      success: true,
      data: items,
      message: 'Sidebar Items fetched successfully',
    })
  }

  async show({ auth, params, response }: HttpContext) {
    const version = await this.checkVersionMustExist(auth, params.projectSlug, params.version)
    const item = await this.checkItemMustExist(version, params.itemSlug)

    return response.ok({
      success: true,
      data: item,
      message: 'Sidebar Item fetched successfully',
    })
  }

  async store({ auth, params, request, response }: HttpContext) {
    const version = await this.checkVersionMustExist(auth, params.projectSlug, params.version)
    const validate = await request.validateUsing(createSidebarItemValidator)

    const item = await version.related('sidebarItem').create({ ...validate, versionId: version.id })

    // reordering the separators
    const items = await version.related('sidebarItem').query().orderBy('order', 'asc')
    // eslint-disable-next-line unicorn/no-for-loop
    for (let i = 0; i < items.length; i++) {
      items[i].order = i + 1
      await items[i].save()
    }

    return response.created({
      success: true,
      data: item,
      message: 'Sidebar Item created successfully',
    })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const version = await this.checkVersionMustExist(auth, params.projectSlug, params.version)
    const item = await this.checkItemMustExist(version, params.itemSlug)
    const validate = await request.validateUsing(updateSidebarItemValidator)
    item.merge(validate)
    await item.save()

    // reordering the separators
    const items = await version.related('sidebarItem').query().orderBy('order', 'asc')
    // eslint-disable-next-line unicorn/no-for-loop
    for (let i = 0; i < items.length; i++) {
      items[i].order = i + 1
      await items[i].save()
    }

    return response.ok({
      success: true,
      data: item,
      message: 'Sidebar Item updated successfully',
    })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const version = await this.checkVersionMustExist(auth, params.projectSlug, params.version)
    const item = await this.checkItemMustExist(version, params.itemSlug)

    await item.delete()

    // reordering the separators
    const items = await version.related('sidebarItem').query().orderBy('order', 'asc')
    let order = 1
    for (const itemx of items) {
      itemx.order = order++
      await itemx.save()
    }

    return response.ok({
      success: true,
      data: item,
      message: 'Sidebar Item deleted successfully',
    })
  }

  async attachToSeparator({ auth, params, response }: HttpContext) {
    const version = await this.checkVersionMustExist(auth, params.projectSlug, params.version)
    const separator = await this.checkSeparatorMustExist(version, params.separatorSlug)
    const item = await this.checkItemMustExist(version, params.itemSlug)

    item.sidebarSeparatorId = separator.id
    await item.save()

    return response.ok({
      success: true,
      message: 'Sidebar Item attached to Separator successfully',
    })
  }

  async detachFromSeparator({ auth, params, response }: HttpContext) {
    const version = await this.checkVersionMustExist(auth, params.projectSlug, params.version)
    const item = await this.checkItemMustExist(version, params.itemSlug)

    item.sidebarSeparatorId = null
    await item.save()

    return response.ok({
      success: true,
      message: 'Sidebar Item detached from Separator successfully',
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

  private async checkItemMustExist(version: Version, itemSlug: string): Promise<SidebarItem> {
    const item = await version.related('sidebarItem').query().where('slug', itemSlug).first()
    if (!item) {
      throw new ResponseError('Sidebar Item not found', { status: 404 })
    }

    return item
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
