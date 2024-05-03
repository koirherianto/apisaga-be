import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, manyToMany, beforeCreate, beforeSave } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Project from '#models/project'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  static accessTokens = DbAccessTokensProvider.forModel(User)

  // id pakai uuid
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare username: string

  @column()
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @beforeCreate()
  static assignUuid(user: User) {
    user.id = crypto.randomUUID()
  }

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }

  // relasi many to many ke project
  @manyToMany(() => Project, {
    localKey: 'id', // nama kolom primary key di table ini
    pivotForeignKey: 'user_id', // nama kolom foreign key di pivot table
    relatedKey: 'id', // nama kolom primary key di table target
    pivotRelatedForeignKey: 'project_id', // nama kolom foreign key di pivot table
    pivotTable: 'project_user', // nama pivot table
    pivotColumns: [], // jika tabel pivot memiliki kolom tambahan
    pivotTimestamps: {
      // jika tabel pivot memiliki kolom timestamps
      createdAt: 'created_at',
      updatedAt: false,
    },
  })
  declare projects: ManyToMany<typeof Project>
}
