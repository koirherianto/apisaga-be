import vine from '@vinejs/vine'

export const createProjectValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(4).toLowerCase(),
    email: vine.string().trim().email(),
    username: vine.string().trim().minLength(4).toLowerCase(),
    password: vine.string().trim().minLength(6),
  })
)
