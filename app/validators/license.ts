import vine from '@vinejs/vine'
import { uniqueCustom } from './costume/uniq.js'
import ResponseError from '#exceptions/respon_error_exception'

// uuid validator
export const licenseIdValidator = vine.compile(
    vine.string().uuid({ version: [4] }).exists(async (db, value) => {
        const row = await db.from('licenses').where('id', value).first()
        if (!row) {
            // field.report('The {{ field }} field is not valid', 'uuid', field)
            throw new ResponseError('License not found', { status: 404 })
        }
        return row
    })
)

export const createLicenseValidator = vine.compile(
    vine.object({
        name: vine.string().trim().use(uniqueCustom({table: 'licenses', column: 'name'}))
    })
)

export function updateLicenseValidator(id : string) { // Capture id as a parameter
  return vine
    .compile(
      vine.object({
        name: vine.string().trim().use(uniqueCustom({ table: 'licenses', column: 'name', except: id }))
      })
    );
}