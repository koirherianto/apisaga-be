import { Exception } from '@adonisjs/core/exceptions'

export default class ResponErrorException extends Exception {
  static status = 500
}
