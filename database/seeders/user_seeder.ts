import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class UserSeeder extends BaseSeeder {
  static environment = ['testing', 'development']
  async run() {
    await User.createMany([
      {
        name: 'test3',
        username: 'test3',
        email: 'test3@test3@gmail.com',
        password: '123456',
      },
    ])
  }
}
