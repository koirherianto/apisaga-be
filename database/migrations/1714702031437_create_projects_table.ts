import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.uuid('license_id').references('id').inTable('licenses').onDelete('CASCADE')
      table.string('title', 200).notNullable()
      table.enum('type_project', ['version', 'brance'])
      table.text('description').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at')
      table.timestamp('deleted_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
