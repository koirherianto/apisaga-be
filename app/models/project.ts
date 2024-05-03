import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import License from '#models/license'
import Version from '#models/version'
import User from './user.js'
export default class Project extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare licenseId: string

  @column()
  declare title: string

  @column()
  declare type: string

  @column()
  declare visibility: string

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(project: Project) {
    project.id = crypto.randomUUID()
  }

  @belongsTo(() => License, {
    foreignKey: 'license_id',
  })
  declare license: BelongsTo<typeof License>

  @hasMany(() => Version)
  declare versions: HasMany<typeof Version>

  @manyToMany(() => User)
  declare users: ManyToMany<typeof User>
}
