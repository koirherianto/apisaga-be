import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import SidebarItem from '#models/sidebar_item'
import SidebarSeparator from '#models/sidebar_separator'
import Version from './version.js'
import string from '@adonisjs/core/helpers/string'

export default class TopBar extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare versionId: string

  @column()
  declare name: string

  @column()
  declare slug: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Version)
  declare version: BelongsTo<typeof Version>

  @hasMany(() => SidebarItem)
  declare sidebarItem: HasMany<typeof SidebarItem>

  @hasMany(() => SidebarSeparator)
  declare sidebarSeparator: HasMany<typeof SidebarSeparator>

  @beforeCreate()
  static async assignUuid(topbar: TopBar) {
    topbar.id = crypto.randomUUID()

    const baseSlug = string.slug(topbar.name, { lower: true })
    let slug = baseSlug
    let count = 1

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existingProject = await TopBar.query().where('slug', slug).first()
      if (!existingProject || existingProject.id === topbar.id) {
        break
      }
      slug = `${baseSlug}-${count}`
      count++
    }
    topbar.slug = slug
  }
}
