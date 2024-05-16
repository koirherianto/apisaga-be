import vine from '@vinejs/vine'

export const projectIdValidator = vine.compile(
  vine
    .string()
    .uuid()
    .exists(async (db, value) => {
      const row = await db.from('projects').where('id', value).first()
      return row
    })
)

export const createProjectValidator = vine.compile(
  vine.object({
    licenseId: vine.string().trim().uuid().optional(),
    title: vine.string().trim().minLength(4).maxLength(100),
    type: vine.enum(['version', 'brance']),
    visibility: vine.enum(['public', 'private']),
    description: vine.string().trim().optional(),
  })
)

export const updateProjectValidator = vine.compile(
  vine.object({
    licenseId: vine.string().trim().uuid().optional(),
    title: vine.string().trim().minLength(4).maxLength(100).optional(),
    type: vine.enum(['version', 'brance']).optional(),
    visibility: vine.enum(['public', 'private']).optional(),
    description: vine.string().trim().optional(),
  })
)
