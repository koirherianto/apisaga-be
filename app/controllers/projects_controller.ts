import Project from '#models/project'
import SidebarItem from '#models/sidebar_item'
import TopBar from '#models/top_bar'
import Version from '#models/version'
import {
  createProjectValidator,
  projectSlugValidator,
  updateProjectValidator,
} from '#validators/project'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ProjectsController {
  async index({ auth, response }: HttpContext) {
    const isLogin = await auth.check()

    if (isLogin) {
      const projects = await auth.user!.related('projects').query().preload('license')

      return response.ok({
        success: true,
        isLogin,
        data: projects,
        message: 'Data fetched successfully',
      })
    } else {
      const projects = await Project.query()
        .orderBy('created_at', 'desc')
        .limit(5)
        .preload('license')
      return response.status(200).json({
        success: true,
        isLogin,
        data: projects,
        message: 'Data fetched successfully',
      })
    }
  }

  async store({ auth, request, response }: HttpContext) {
    // return data
    const data = await request.validateUsing(createProjectValidator)
    const trx = await db.transaction()
    try {
      const user = auth.user!
      const project = await Project.create(data, { client: trx })
      user.related('projects').save(project)

      // Create version within the transaction
      const version = await Version.create(
        {
          projectId: project.id,
          name: '1.0.0',
          isDefault: true,
          visibility: 'public',
        },
        { client: trx }
      )

      // Create TopBar within the transaction
      const topBar = await TopBar.create(
        {
          versionId: version.id,
          name: 'Main',
          isDefault: true,
        },
        { client: trx }
      )

      // // Create SidebarItem within the transaction
      await SidebarItem.create(
        {
          topBarId: topBar.id,
          name: 'Introduction',
          order: 1,
          isDefault: true,
          content: '# Introduction\n\nThis is the introduction of your project',
        },
        { client: trx }
      )

      await trx.commit()

      return response.created({
        success: true,
        data: project,
        message: 'Project created successfully',
      })
    } catch (error) {
      await trx.rollback()
      throw error // Re-throw the error for handling
    }
  }

  async show({ auth, response, params }: HttpContext) {
    const isLogin = await auth.check()
    const slug = await projectSlugValidator.validate(params.slug)
    if (isLogin) {
      // redirect ke project dengan versi terbaru seharusnya

      const project = await auth
        .user!.related('projects')
        .query()
        .preload('versions')
        .where('slug', slug)
        .first()

      return response.status(200).json({
        success: true,
        data: project,
        isLogin,
        message: 'Project fetched successfully',
      })
    } else {
      const project = await Project.query().preload('versions').where('slug', slug).first()

      return response.status(200).json({
        success: true,
        data: project,
        isLogin,
        message: 'Project fetched successfully',
      })
    }
  }

  async update({ auth, request, response, params }: HttpContext) {
    const slug = await projectSlugValidator.validate(params.id)
    const data = await request.validateUsing(updateProjectValidator)
    const project = await auth.user!.related('projects').query().where('slug', slug).first()

    project?.merge(data)
    await project?.save()

    return response.status(200).json({
      success: true,
      data: project,
      message: 'Project updated successfully',
    })
  }

  async destroy({ auth, response, params }: HttpContext) {
    const slug = await projectSlugValidator.validate(params.slug)
    const project = await auth.user!.related('projects').query().where('slug', slug).first()
    await project?.delete()

    return response.status(200).json({
      success: true,
      data: project,
      message: 'Project deleted successfully',
    })
  }

  async projectDefaultVersion({ auth, response, params }: HttpContext) {
    const slug = await projectSlugValidator.validate(params.slug)
    // return auth.user!.related('projects').query()
    const project = await auth.user!.related('projects').query().where('slug', slug).first()
    // return project
    const version = await project?.related('versions').query().where('isDefault', true).first()
    // return version
    const topBar = await version?.related('topBars').query().where('isDefault', true).first()
    // return topBar
    const sidebarItem = await topBar
      ?.related('sidebarItems')
      .query()
      .where('isDefault', true)
      .first()

    const defaultVersion = {
      defaultProject: slug,
      defaultVersion: version?.name,
      defaultTopbar: topBar?.slug,
      defaultLeftbar: sidebarItem?.slug,
    }

    return response.status(200).json({
      success: true,
      data: defaultVersion,
      message: 'Default version fetched successfully',
    })
  }
}
