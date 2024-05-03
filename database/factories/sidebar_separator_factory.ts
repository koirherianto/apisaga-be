import factory from '@adonisjs/lucid/factories'
import SidebarSeparator from '#models/sidebar_separator'

export const SidebarSeparatorFactory = factory
  .define(SidebarSeparator, async ({ faker }) => {
    return {}
  })
  .build()