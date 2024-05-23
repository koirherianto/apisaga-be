import vine from '@vinejs/vine'

export const createSidebarSeparatorValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(4).maxLength(100),
    order: vine.number().positive().min(1),
  })
)

export const updateSidebarSeparatorValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(4).maxLength(100),
    order: vine.number().positive().min(1),
  })
)
