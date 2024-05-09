import vine from '@vinejs/vine'

// uuid validator
export const licenseIdValidator = vine.compile(
    vine.string().uuid().exists(async (db, value) => {
        const row = await db.from('licenses').where('id', value).first()
        // if (!row) {
        //     field.report('The {{ field }} field is not valid', 'uuid', field)
        // }
        return row
    })
)

export const createLicenseValidator = vine.compile(
    vine.object({
        name: vine.string().trim().unique(async (db, value) => {
            const user = await db
              .from('licenses')
              .where('name', value)
              .first()
            return !user
          })
    })
)

export const updateLicenseValidator = vine.
    withMetaData<{ id: string }>().compile(
    vine.object({
        name: vine.string().trim().unique(async (db, value, field) => {
            const user = await db
              .from('licenses')
              .whereNot('id', field.meta.id)
              .where('name', value)
              .first()
            return !user
          })
    })
)