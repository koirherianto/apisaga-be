import {
  createProjectValidator,
  projectIdValidator,
  updateProjectValidator,
} from '#validators/project'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProjectsController {
  async index({ auth, response }: HttpContext) {
    const projects = await auth.user!.related('projects').query().preload('license')

    return response.ok({
      success: true,
      data: projects,
      messages: 'Data fetched successfully',
    })
  }

  async store({ auth, request, response }: HttpContext) {
    const data = await request.validateUsing(createProjectValidator)
    const project = await auth.user!.related('projects').create(data)

    return response.created({
      success: true,
      data: project,
      messages: 'Data created successfully',
    })
  }

  async show({ auth, response, params }: HttpContext) {
    const id = await projectIdValidator.validate(params.id)
    const project = await auth.user!.related('projects').query().where('id', id).first()
    return response.status(200).json({
      success: true,
      data: project,
      messages: 'Data fetched successfully',
    })
  }

  async update({ auth, request, response, params }: HttpContext) {
    const id = await projectIdValidator.validate(params.id)
    const data = await request.validateUsing(updateProjectValidator)
    const project = await auth.user!.related('projects').query().where('id', id).first()

    project?.merge(data)
    await project?.save()

    return response.status(200).json({
      success: true,
      data: project,
      messages: 'Data updated successfully',
    })
  }

  async destroy({ auth, response, params }: HttpContext) {
    const id = await projectIdValidator.validate(params.id)
    const project = await auth.user!.related('projects').query().where('id', id).first()
    await project?.delete()

    return response.status(200).json({
      success: true,
      data: project,
      messages: 'Data deleted successfully',
    })
  }
}
