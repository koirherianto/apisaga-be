import type { HttpContext } from '@adonisjs/core/http'

export default class VersionsController {
  async index({ view }: HttpContext) {
    return view.render('versions/index')
  }
}
