import factory from '@adonisjs/lucid/factories'
import License from '#models/license'

export const LicenseFactory = factory
  .define(License, async ({ faker }) => {
    return {}
  })
  .build()