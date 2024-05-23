import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Version from './version.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import SidebarItem from './sidebar_item.js'
import string from '@adonisjs/core/helpers/string'

export default class SidebarSeparator extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare versionId: string

  @column()
  declare name: string

  @column()
  declare slug: String

  @column()
  declare order: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async assignUuid(sidebarSeparator: SidebarSeparator) {
    sidebarSeparator.id = crypto.randomUUID()

    if (sidebarSeparator.name) {
      const baseSlug = string.slug(sidebarSeparator.name)
      let slug = baseSlug
      let count = 1

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const existingSeparator = await SidebarSeparator.query().where('slug', slug).first()
        if (!existingSeparator || existingSeparator.id === sidebarSeparator.id) {
          break
        }
        slug = `${baseSlug}-${count}`
        count++
      }

      sidebarSeparator.slug = slug
    }
  }

  // @beforeUpdate()
  // static async assignSlug(sidebarSeparator: SidebarSeparator) {
  //   if (sidebarSeparator.$dirty.name) {
  //     const baseSlug = string.slug(sidebarSeparator.name)
  //     let slug = baseSlug
  //     let count = 1

  //     // eslint-disable-next-line no-constant-condition
  //     while (true) {
  //       const existingSeparator = await SidebarSeparator.query().where('slug', slug).first()
  //       if (!existingSeparator || existingSeparator.id === sidebarSeparator.id) {
  //         break
  //       }
  //       slug = `${baseSlug}-${count}`
  //       count++
  //     }

  //     sidebarSeparator.slug = slug
  //   }
  // }

  @belongsTo(() => Version)
  declare version: BelongsTo<typeof Version>

  @hasMany(() => SidebarItem)
  declare sidebarItems: HasMany<typeof SidebarItem>
}
