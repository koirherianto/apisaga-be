/* eslint-disable prettier/prettier */

import { middleware } from '#start/kernel'
const AuthController = () => import('#controllers/auth_controller')
const LicensesController = () => import('#controllers/licenses_controller')
const ProjectsController = () => import('#controllers/projects_controller')
const VersionsController = () => import('#controllers/versions_controller')
import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return { message: 'Hello world' }
})

router.group(() => {
  router.post('/register', [AuthController, 'register'])
  router.post('/login', [AuthController, 'login'])

  router.group(() => {
    router.get('/me', [AuthController, 'me'])
    router.delete('/logout', [AuthController, 'logout'])

    router.resource('/licenses', LicensesController)
    router.resource('/projects', ProjectsController)

    router.get('/projects/:slug/version', [VersionsController, 'index'])
    router.get('/projects/:slug/version/:version', [VersionsController, 'show'])
    router.post('/projects/:slug/version', [VersionsController, 'store'])
    router.put('/projects/:slug/version/:version', [VersionsController, 'update'])
    router.delete('/projects/:slug/version/:version', [VersionsController, 'destroy'])

  }).use(middleware.auth())
}).prefix('api')
