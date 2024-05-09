import License from '#models/license'
import { createLicenseValidator, licenseIdValidator, updateLicenseValidator } from '#validators/license'
import type { HttpContext } from '@adonisjs/core/http'

export default class LicensesController {
    async index({ response }: HttpContext) {
        const licenses = await License.all()

        return response.status(200).json({
            success: true,
            data: licenses,
            message: 'Licenses data retrieved successfully',
        })
    }

    async show({response, params  }: HttpContext) {
        await licenseIdValidator.validate(params.id)
        const license = await License.find(params.id)

        if (!license) {
            return response.status(404).json({
                success: false,
                message: 'License not found',
            })
        }

        return response.status(200).json({
            success: true,
            data: license,
            message: 'Get license data successfully',
        })
    }

    async store({ request, response }: HttpContext) {
        const validate = await request.validateUsing(createLicenseValidator)
        const license = await License.create({ name : validate.name })
        return response.status(201).json({
            success: true,
            license: license,
            message: 'License created successfully',
        })
    }

    async update({ request, response, params }: HttpContext) {
        const id = await licenseIdValidator.validate(params.id)
        const validate = await request.validateUsing(updateLicenseValidator(id))
        
        const license = await License.findOrFail(id)

        license.name = validate.name
        await license.save()

        return response.status(200).json({
            success: true,
            data : license,
            message: `License updated successfully`,
        })
    }

    async destroy({ response, params }: HttpContext) {
        const id = await licenseIdValidator.validate(params.id)

        const license = await License.findOrFail(id)
        await license.delete()

        return response.status(200).json({
            success: true,
            licenseId : license.id,
            message: `License deleted successfully`,
        })
    }
}