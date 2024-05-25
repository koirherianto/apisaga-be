import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Version from '#models/version'
import SidebarSeparator from '#models/sidebar_separator'
import string from '@adonisjs/core/helpers/string'

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
  declare slug: string

  @column()
  declare order: number

  @column()
  declare content: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async assignUuid(sidebarItem: SidebarItem) {
    sidebarItem.id = crypto.randomUUID()

    if (sidebarItem.name) {
      const baseSlug = string.slug(sidebarItem.name, { lower: true })
      let slug = baseSlug
      let count = 1

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const existingSeparator = await SidebarItem.query().where('slug', slug).first()
        if (!existingSeparator || existingSeparator.id === sidebarItem.id) {
          break
        }
        slug = `${baseSlug}-${count}`
        count++
      }

      sidebarItem.slug = slug
    }
  }

  @belongsTo(() => Version)
  declare version: BelongsTo<typeof Version>

  @belongsTo(() => SidebarSeparator, {
    foreignKey: 'sidebarSeparatorId',
  })
  declare sidebarSeparator: BelongsTo<typeof SidebarSeparator>
}
