import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'project_user'

  async up() {
    // pivot table
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
