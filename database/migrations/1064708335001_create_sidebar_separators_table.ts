import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sidebar_separators'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table
        .uuid('version_id')
        .notNullable()
        .references('id')
        .inTable('versions')
        .onDelete('CASCADE')
      table.string('name', 100).notNullable()
      table.string('slug', 150).notNullable()
      table.tinyint('order').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at')
      table.timestamp('deleted_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
