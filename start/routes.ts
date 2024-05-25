/* eslint-disable prettier/prettier */

const AuthController = () => import('#controllers/auth_controller')
const LicensesController = () => import('#controllers/licenses_controller')
const ProjectsController = () => import('#controllers/projects_controller')
const VersionsController = () => import('#controllers/versions_controller')
const SidebarSeparator = () => import('#controllers/sidebar_separators_controller')
const SidebarItem = () => import('#controllers/sidebar_items_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return { message: 'Hello world' }
})

router.group(() => {
  router.post('/register', [AuthController, 'register'])
  router.post('/login', [AuthController, 'login'])

  router.get('tes', async ({ auth}) => {
    if (await auth.check()) {
      return 'logged in'
    }

    return 'y'
  })

  router.group(() => {
    // apakah bisa di akses tanpa token
    router.get('/me', [AuthController, 'me']) //no
    router.delete('/logout', [AuthController, 'logout']) //no

    // tidak bisa diakses tanpa token
    // untuk mendapatkan data dari licen harus terhubung ke project
    router.resource('/licenses', LicensesController)

    
    router.resource('/projects', ProjectsController)

    router.get('/projects/:slug/version', [VersionsController, 'index']) //yes
    router.get('/projects/:slug/version/:version', [VersionsController, 'show']) //yes
    router.post('/projects/:slug/version', [VersionsController, 'store'])
    router.put('/projects/:slug/version/:version', [VersionsController, 'update'])
    router.delete('/projects/:slug/version/:version', [VersionsController, 'destroy'])

    // Sidebar Separator Routes
    router.get('/projects/:projectSlug/version/:version/sidebar-separator', [SidebarSeparator, 'index'])
    router.post('/projects/:slug/version/:version/sidebar-separator', [SidebarSeparator, 'store'])
    router.get('/projects/:projectSlug/version/:version/sidebar-separator/:separatorSlug', [SidebarSeparator, 'show'])
    router.put('/projects/:projectSlug/version/:version/sidebar-separator/:separatorSlug', [SidebarSeparator, 'update'])
    router.delete('/projects/:projectSlug/version/:version/sidebar-separator/:separatorSlug', [SidebarSeparator, 'destroy'])

    // Sidebar Item Routes
    router.get('/projects/:projectSlug/version/:version/sidebar-items', [SidebarItem, 'index'])
    router.post('/projects/:projectSlug/version/:version/sidebar-items', [SidebarItem, 'store'])
    router.get('/projects/:projectSlug/version/:version/sidebar-items/:itemSlug', [SidebarItem, 'show'])
    router.put('/projects/:projectSlug/version/:version/sidebar-items/:itemSlug', [SidebarItem, 'update'])
    router.delete('/projects/:projectSlug/version/:version/sidebar-items/:itemSlug', [SidebarItem, 'destroy'])

    // Relationship Management Routes
    router.post('/projects/:projectSlug/version/:version/sidebar-separators/:separatorSlug/sidebar-items/:itemSlug', [SidebarItem, 'attachToSeparator'])
    router.delete('/projects/:projectSlug/version/:version/sidebar-separators/:separatorSlug/sidebar-items/:itemSlug', [SidebarItem, 'detachFromSeparator'])

  }).use(middleware.auth())

  
}).prefix('api')
