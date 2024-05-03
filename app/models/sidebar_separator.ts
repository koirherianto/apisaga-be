import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Version from './version.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import SidebarItem from './sidebar_item.js'

export default class SidebarSeparator extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare versionId: string

  @column()
  declare name: string

  @column()
  declare order: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(sidebarSeparator: SidebarSeparator) {
    sidebarSeparator.id = crypto.randomUUID()
  }

  @belongsTo(() => Version)
  declare version: BelongsTo<typeof Version>

  @hasMany(() => SidebarItem)
  declare sidebarItems: HasMany<typeof SidebarItem>
}
