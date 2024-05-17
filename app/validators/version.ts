import vine from '@vinejs/vine'

export const versio = vine.compile(vine.string())

export const createVersionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(4).maxLength(100),
    isDefault: vine.boolean().optional(),
    versionStatus: vine.enum(['major', 'minor', 'patch']).optional(),
    visibility: vine.enum(['public', 'private']),
  })
)

export const updateVersionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(4).maxLength(100).optional(),
    isDefault: vine.boolean().optional(),
    versionStatus: vine.enum(['major', 'minor', 'patch']).optional(),
    visibility: vine.enum(['public', 'private']).optional(),
  })
)
