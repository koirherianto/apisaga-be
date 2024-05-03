import factory from '@adonisjs/lucid/factories'
import SidebarItem from '#models/sidebar_item'

export const SidebarItemFactory = factory
  .define(SidebarItem, async ({ faker }) => {
    return {}
  })
  .build()