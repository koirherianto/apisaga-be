import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Project from '#models/project'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import TobBar from './tob_bar.js'

export default class Version extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare projectId: string

  @column()
  declare name: string

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

  @hasMany(() => TobBar)
  declare topBars: HasMany<typeof TobBar>

  @belongsTo(() => Project)
  declare project: BelongsTo<typeof Project>
}
