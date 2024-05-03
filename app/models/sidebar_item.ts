import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Version from '#models/version'
import SidebarSeparator from '#models/sidebar_separator'

export default class SidebarItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare versionId: string

  @column()
  declare sidebarSeparatorId: string | null

  @column()
  declare name: string

  @column()
  declare order: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(sidebarItem: SidebarItem) {
    sidebarItem.id = crypto.randomUUID()
  }

  @belongsTo(() => Version)
  declare version: BelongsTo<typeof Version>

  @belongsTo(() => SidebarSeparator, {
    foreignKey: 'sidebar_separator_id',
  })
  declare sidebarSeparator: BelongsTo<typeof SidebarSeparator>
}
