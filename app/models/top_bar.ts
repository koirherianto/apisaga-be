import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import SidebarItem from '#models/sidebar_item'
import SidebarSeparator from '#models/sidebar_separator'
import Version from './version.js'

export default class TopBar extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare versionId: string

  @column()
  declare name: string

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
}
