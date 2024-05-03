import factory from '@adonisjs/lucid/factories'
import Project from '#models/project'

export const ProjectFactory = factory
  .define(Project, async ({ faker }) => {
    return {faker}
  })
  .build()
