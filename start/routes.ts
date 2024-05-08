/* eslint-disable prettier/prettier */

import { middleware } from '#start/kernel'
const AuthController = () => import('#controllers/auth_controller')
const LicensesController = () => import('#controllers/licenses_controller')
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

    // router.post('/license', [LicensesController, 'store'])
    router.resource('/licenses', LicensesController)
  }).use(middleware.auth())
}).prefix('api')
