import Project from '#models/project'
import {
  createProjectValidator,
  projectSlugValidator,
  updateProjectValidator,
} from '#validators/project'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProjectsController {
  async index({ auth, response }: HttpContext) {
    const isLogin = await auth.check()

    if (isLogin) {
      const projects = await auth.user!.related('projects').query().preload('license')

      return response.ok({
        success: true,
        authorized: isLogin,
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
        authorized: isLogin,
        data: projects,
        message: 'Data fetched successfully',
      })
    }
  }

  async store({ auth, request, response }: HttpContext) {
    const data = await request.validateUsing(createProjectValidator)
    const project = await auth.user!.related('projects').create(data)

    return response.created({
      success: true,
      data: project,
      message: 'Project created successfully',
    })
  }

  async show({ auth, response, params }: HttpContext) {
    const slug = await projectSlugValidator.validate(params.id)
    const project = await auth.user!.related('projects').query().where('slug', slug).first()

    return response.status(200).json({
      success: true,
      data: project,
      message: 'Project fetched successfully',
    })
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
    const slug = await projectSlugValidator.validate(params.id)
    const project = await auth.user!.related('projects').query().where('slug', slug).first()
    await project?.delete()

    return response.status(200).json({
      success: true,
      data: project,
      message: 'Project deleted successfully',
    })
  }
}
