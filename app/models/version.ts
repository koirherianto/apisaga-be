import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Project from '#models/project'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import SidebarItem from '#models/sidebar_item'
import SidebarSeparator from '#models/sidebar_separator'

export default class Version extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare projectId: string

  @column()
  declare name: string

  @column()
  declare content: string | null

  @column()
  declare isDefault: boolean

  @column()
  declare versionStatus: string | null

  @column()
  declare visibility: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(version: Version) {
    version.id = crypto.randomUUID()
  }

  @belongsTo(() => Project)
  declare project: BelongsTo<typeof Project>

  @hasMany(() => SidebarItem)
  declare sidebarItem: HasMany<typeof SidebarItem>

  @hasMany(() => SidebarSeparator)
  declare sidebarSeparator: HasMany<typeof SidebarSeparator>
}
